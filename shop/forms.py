# shop/forms.py
from django import forms

class CheckoutForm(forms.Form):
    full_name = forms.CharField(max_length=200, required=True, label='Full name')
    phone = forms.CharField(max_length=20, required=True, label='Phone')
    address = forms.CharField(widget=forms.Textarea(attrs={'rows':3}), required=True, label='Location / Address')
    landmark = forms.CharField(max_length=255, required=False, label='Landmark (optional)')
