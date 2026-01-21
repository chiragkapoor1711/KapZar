from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image_url']

class ProductSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'category', 'category_slug', 'name', 'slug', 'description', 
                  'price', 'stock', 'image_url', 'available']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'price', 'quantity', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'full_name', 'phone', 'address', 'created_at', 
                  'delivery_charge', 'subtotal', 'total', 'is_paid', 
                  'payment_txn_id', 'payment_method', 'items']
        read_only_fields = ['user', 'created_at', 'delivery_charge', 'subtotal', 'total', 'is_paid']

class OrderCreateSerializer(serializers.Serializer):
    """
    Serializer to validate incoming order data from frontend.
    Expected payload:
    {
        "full_name": "...",
        "phone": "...",
        "address": "...",
        "items": [
            {"product_id": 1, "quantity": 2},
            ...
        ]
    }
    """
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField()
    items = serializers.ListField(child=serializers.DictField())

