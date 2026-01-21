# Filename: shop/cart.py
from decimal import Decimal, InvalidOperation
from typing import Dict, Iterator, Any
from django.conf import settings

# Single session key constant (change if you prefer a different key)
SESSION_KEY = getattr(settings, 'CART_SESSION_ID', 'cart')


class Cart:
    """
    Session-backed shopping cart.
    - Each cart item stored under key = product_id (string)
    - Item structure (stored in session): {
          'quantity': int,
          'price': str (Decimal serialized as string),
          'name': str,
          'image_url': str (optional)
      }
    All arithmetic converts price back to Decimal to avoid float errors.
    """
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get(SESSION_KEY)
        if cart is None:
            cart = self.session[SESSION_KEY] = {}
        self.cart: Dict[str, Dict[str, Any]] = cart

    def add(self, product, quantity: int = 1, override_quantity: bool = False) -> None:
        """
        Add product to cart or update quantity.
        - product: Django model instance with `id`, `price`, `name` (and optional image_url)
        - quantity: int
        - override_quantity: if True set the quantity to given number; else increment
        """
        pid = str(product.id)
        try:
            qty = int(quantity)
        except (TypeError, ValueError):
            qty = 1

        if pid not in self.cart:
            self.cart[pid] = {
                'quantity': 0,
                'price': str(product.price),  # store as string to keep Decimal precision
                'name': getattr(product, 'name', ''),
                'image_url': getattr(product, 'image_url', '')
            }

        if override_quantity:
            self.cart[pid]['quantity'] = qty
        else:
            # ensure stored quantity is always an int
            existing = self.cart[pid].get('quantity', 0)
            try:
                existing = int(existing)
            except (TypeError, ValueError):
                existing = 0
            self.cart[pid]['quantity'] = existing + qty

        self.save()

    def update(self, product, quantity: int) -> None:
        """
        Set quantity for a given product. Removes item if quantity <= 0.
        """
        pid = str(product.id)
        try:
            qty = int(quantity)
        except (TypeError, ValueError):
            return  # invalid input - ignore

        if pid in self.cart:
            if qty <= 0:
                self.remove(product)
            else:
                self.cart[pid]['quantity'] = qty
                self.save()

    def remove(self, product) -> None:
        """
        Remove a product from the cart.
        """
        pid = str(product.id)
        if pid in self.cart:
            del self.cart[pid]
            self.save()

    def clear(self) -> None:
        """
        Remove cart from session.
        """
        self.session[SESSION_KEY] = {}
        self.session.modified = True
        self.cart = self.session[SESSION_KEY]

    def save(self) -> None:
        """
        Persist the cart dict back to session and mark modified.
        """
        self.session[SESSION_KEY] = self.cart
        self.session.modified = True

    def __iter__(self) -> Iterator[Dict[str, Any]]:
        """
        Iterate over cart items returning enriched dicts:
        {
            'id': product_id (string),
            'name': ...,
            'image_url': ...,
            'price': Decimal(...),
            'quantity': int,
            'total_price': Decimal(...)
        }
        Avoid mutating the session data while iterating.
        """
        for pid, item in list(self.cart.items()):
            if not isinstance(item, dict):
                # skip corrupted entries
                continue
            # Prepare safe conversions
            try:
                price = Decimal(item.get('price', '0'))
            except (InvalidOperation, TypeError):
                price = Decimal('0')

            try:
                quantity = int(item.get('quantity', 0))
            except (TypeError, ValueError):
                quantity = 0

            yield {
                'id': pid,
                'name': item.get('name', ''),
                'image_url': item.get('image_url', ''),
                'price': price,
                'quantity': quantity,
                'total_price': price * quantity
            }

    def get_total_price(self) -> Decimal:
        """
        Compute and return cart total as Decimal.
        """
        total = Decimal('0')
        for item in self.cart.values():
            if not isinstance(item, dict):
                continue
            try:
                price = Decimal(item.get('price', '0'))
            except (InvalidOperation, TypeError):
                price = Decimal('0')
            try:
                qty = int(item.get('quantity', 0))
            except (TypeError, ValueError):
                qty = 0
            total += price * qty
        return total

    def merge_session_cart(self, other_cart: Dict[str, Dict[str, Any]]) -> None:
        """
        Merge another session-style cart dict into this cart.
        Useful to merge a user's saved cart when they log in.
        """
        if not isinstance(other_cart, dict):
            return
        for pid, item in other_cart.items():
            if not isinstance(item, dict):
                continue
            try:
                other_qty = int(item.get('quantity', 0))
            except (TypeError, ValueError):
                other_qty = 0
            if other_qty <= 0:
                continue
            if pid in self.cart:
                try:
                    existing = int(self.cart[pid].get('quantity', 0))
                except (TypeError, ValueError):
                    existing = 0
                self.cart[pid]['quantity'] = existing + other_qty
            else:
                # ensure price/name keys exist
                self.cart[pid] = {
                    'quantity': other_qty,
                    'price': str(item.get('price', '0')),
                    'name': item.get('name', ''),
                    'image_url': item.get('image_url', '')
                }
        self.save()
