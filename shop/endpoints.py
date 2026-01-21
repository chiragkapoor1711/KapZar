from decimal import Decimal
from rest_framework import generics, status, views, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Category, Product, Order, OrderItem
from .serializers import (
    RegisterSerializer, UserSerializer, CategorySerializer, 
    ProductSerializer, OrderSerializer, OrderCreateSerializer
)

# Helper function
def calc_delivery_charge(subtotal: Decimal) -> Decimal:
    """Simple fallback: free delivery over 499, else flat 40."""
    return Decimal('0.00') if subtotal >= Decimal('499.00') else Decimal('40.00')

# Authentication APIs
class RegisterAPI(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class LoginAPI(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data
        })

# Product APIs
class CategoryListAPI(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class CategoryCreateAPI(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]

class CategoryDeleteAPI(generics.DestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]

class ProductListAPI(generics.ListAPIView):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # raise Exception(f"DEBUG: Params: {self.request.query_params}")
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('category', None)
        search_query = self.request.query_params.get('q', None)
        
        print(f"DEBUG: Params received - category: {category_slug}, search: {search_query}")

        if category_slug:
            print(f"DEBUG: Filtering by category slug: {category_slug}")
            queryset = queryset.filter(category__slug=category_slug)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
            
        return queryset

class ProductCreateAPI(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]

class ProductDeleteAPI(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]

class ProductDetailAPI(generics.RetrieveAPIView):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

# Order APIs
class OrderCreateAPI(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            subtotal = Decimal('0.00')
            order_items_data = []
            
            for item in data['items']:
                product_id = item.get('product_id')
                quantity = item.get('quantity', 1)
                
                try:
                    product = Product.objects.get(id=product_id, available=True)
                except Product.DoesNotExist:
                    return Response({"error": f"Product {product_id} not found or unavailable"}, status=400)
                
                line_total = product.price * quantity
                subtotal += line_total
                
                order_items_data.append({
                    'product': product,
                    'quantity': quantity,
                    'price': product.price
                })
            
            delivery_charge = calc_delivery_charge(subtotal)
            total = subtotal + delivery_charge
            
            user = request.user if request.user.is_authenticated else None
            
            order = Order.objects.create(
                user=user,
                full_name=data['full_name'],
                phone=data['phone'],
                address=data['address'],
                delivery_charge=delivery_charge,
                subtotal=subtotal,
                total=total,
                is_paid=False,
                payment_method="UPI"
            )
            
            for item_data in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    product_name=item_data['product'].name,
                    price=item_data['price'],
                    quantity=item_data['quantity']
                )
            
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderDetailAPI(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

class ConfirmPaymentAPI(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)
        txn_id = request.data.get('txn_id')
        
        if txn_id:
            order.is_paid = True
            order.payment_txn_id = txn_id
            order.save()
            return Response({"status": "Payment confirmed"}, status=status.HTTP_200_OK)
        return Response({"error": "Transaction ID required"}, status=status.HTTP_400_BAD_REQUEST)
