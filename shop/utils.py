from decimal import Decimal

FREE_DELIVERY_THRESHOLD = Decimal('500.00')
DELIVERY_CHARGE = Decimal('40.00')

def calc_delivery_charge(subtotal: Decimal):
    if subtotal >= FREE_DELIVERY_THRESHOLD:
        return Decimal('0.00')
    return DELIVERY_CHARGE
