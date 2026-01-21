from shop.endpoints import ProductListAPI
from shop.models import Product, Category
from rest_framework.test import APIRequestFactory

c = Category.objects.filter(slug='dairy-eggs').first()
if not c:
    print("Category dairy-eggs missing")
else:
    print(f"Category exists: {c.name}")

factory = APIRequestFactory()
view = ProductListAPI.as_view()

print("--- Testing Filter ---")
# We need to manually invoke because as_view returns a closure
view_instance = ProductListAPI()
request = factory.get('/api/products/?category=dairy-eggs')
view_instance.setup(request)
qs = view_instance.get_queryset()
print(f"Filtered count: {qs.count()}")
for p in qs:
    print(f" - {p.name} ({p.category.slug})")

print("--- Testing No Filter ---")
request = factory.get('/api/products/')
view_instance.setup(request)
qs = view_instance.get_queryset()
print(f"Unfiltered count: {qs.count()}")
