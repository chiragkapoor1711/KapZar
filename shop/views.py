from django.shortcuts import render

# Only keeping a placeholder home view if needed, but primarily serving API now.
# Real usage is in api_views.py

def home(request):
    return render(request, "index.html") # This would be if serving React build, but we are separate.
