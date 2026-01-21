import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('categories/');
                setCategories(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome To KAPZAR</h1>
                <p className="text-lg md:text-xl mb-8 opacity-90">Shop from our wide range of fresh vegetables, fruits, and daily essentials.</p>
                <Link to="/products" className="bg-white text-primary px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-md">
                    Shop Now
                </Link>
            </div>

            {/* Categories */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {categories.map(cat => (
                            <Link
                                to={`/products?category=${cat.slug}`}
                                key={cat.id}
                                className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition aspect-video bg-white"
                            >
                                {cat.image_url ? (
                                    <img
                                        src={cat.image_url}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition group-hover:bg-black/50">
                                    <span className="text-white font-bold text-xl">{cat.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
