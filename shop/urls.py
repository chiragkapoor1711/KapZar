# Filename: shop/urls.py
from django.urls import path
from . import views
from . import views
from . import endpoints as api_views

app_name = "shop"

urlpatterns = [
    # Home (optional, or remove if not serving anything)
    path("", views.home, name="home"),

    # API Endpoints
    path("api/register/", api_views.RegisterAPI.as_view(), name="api_register"),
    path("api/login/", api_views.LoginAPI.as_view(), name="api_login"),
    path("api/categories/", api_views.CategoryListAPI.as_view(), name="api_categories"),
    path("api/categories/create/", api_views.CategoryCreateAPI.as_view(), name="api_category_create"),
    path("api/categories/<int:pk>/delete/", api_views.CategoryDeleteAPI.as_view(), name="api_category_delete"),
    path("api/products/", api_views.ProductListAPI.as_view(), name="api_products"),
    path("api/products/create/", api_views.ProductCreateAPI.as_view(), name="api_product_create"),
    path("api/products/<int:pk>/delete/", api_views.ProductDeleteAPI.as_view(), name="api_product_delete"),
    path("api/products/<int:id>/", api_views.ProductDetailAPI.as_view(), name="api_product_detail"),
    path("api/orders/create/", api_views.OrderCreateAPI.as_view(), name="api_order_create"),
    path("api/orders/<int:id>/", api_views.OrderDetailAPI.as_view(), name="api_order_detail"),
    path("api/orders/<int:order_id>/pay/", api_views.ConfirmPaymentAPI.as_view(), name="api_order_pay"),
]