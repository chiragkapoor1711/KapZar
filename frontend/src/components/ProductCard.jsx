import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col">
            <div className="relative h-36 md:h-48 w-full bg-gray-100">
                {product.image || product.image_url ? (
                    <img
                        src={product.image || product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                    </div>
                )}
                {!product.available && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Out of Stock
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {product.category_slug}
                </div>
                <Link to={`/products/${product.id}`} className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary truncate">
                    {product.name}
                </Link>
                <div className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {product.description}
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    <button
                        onClick={() => addToCart(product)}
                        disabled={!product.available}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${product.available
                            ? 'bg-primary text-white hover:bg-emerald-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
