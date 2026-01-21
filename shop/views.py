from django.http import HttpResponse

# Only keeping a placeholder home view if needed, but primarily serving API now.
# Real usage is in shop/endpoints.py

def home(request):
    return HttpResponse("KapZar Grocery API is live!")
