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
            <div className="relative rounded-2xl overflow-hidden shadow-lg h-[400px] flex items-center justify-center">
                {/* Background Image with Blur */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{
                        backgroundImage: "url('/hero-bg.png')",
                        filter: 'blur(4px) brightness(0.7)'
                    }}
                ></div>

                {/* Content on top */}
                <div className="relative z-10 text-center text-white px-4 md:px-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Welcome To KAPZAR</h1>
                    <p className="text-lg md:text-2xl mb-8 opacity-95 max-w-2xl mx-auto drop-shadow-md font-medium">
                        Shop from our wide range of fresh vegetables, fruits, and daily essentials delivered to your doorstep.
                    </p>
                    <Link to="/products" className="bg-primary text-white border-2 border-white px-10 py-4 rounded-full font-extrabold text-xl hover:bg-white hover:text-primary transition-all duration-300 shadow-xl inline-block hover:scale-105 active:scale-95">
                        Shop Now
                    </Link>
                </div>
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
                                {cat.image || cat.image_url ? (
                                    <img
                                        src={cat.image || cat.image_url}
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
