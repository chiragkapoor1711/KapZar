import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryFilter = searchParams.get('category');
    const qParam = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(qParam);

    // Sync local search term with URL param
    useEffect(() => {
        setSearchTerm(qParam);
    }, [qParam]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = 'products/';
                const params = [];
                if (categoryFilter) params.push(`category=${categoryFilter}`);
                if (searchTerm) params.push(`q=${searchTerm}`);

                if (params.length > 0) url += `?${params.join('&')}`;

                const res = await api.get(url);
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [categoryFilter, searchTerm]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    {categoryFilter ? `Category: ${categoryFilter}` : 'All Products'}
                </h2>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white p-4 rounded-xl h-80 animate-pulse border border-gray-200">
                            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No products found.
                </div>
            )}
        </div>
    );
};

export default ProductList;
