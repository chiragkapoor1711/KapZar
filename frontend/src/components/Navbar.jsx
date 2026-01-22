import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
            setIsSearchOpen(false);
            setIsMenuOpen(false);
        }
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary shrink-0">
                            KapZar Grocery
                        </Link>
                    </div>

                    {/* Desktop Search Bar (Large Screens) */}
                    <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </form>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-gray-700 hover:text-primary transition font-medium">Home</Link>
                        <Link to="/products" className="text-gray-700 hover:text-primary transition font-medium">Products</Link>
                        {user?.is_staff && (
                            <Link to="/admin" className="text-red-600 font-bold hover:text-red-700 transition">Admin Panel</Link>
                        )}

                        <div className="flex items-center space-x-4 ml-4 border-l pl-6 border-gray-100">
                            {/* Search Toggle for medium screens */}
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="lg:hidden text-gray-700 hover:text-primary transition"
                            >
                                <Search className="w-6 h-6" />
                            </button>

                            <Link to="/cart" className="relative text-gray-700 hover:text-primary transition">
                                <ShoppingCart className="w-6 h-6" />
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {getCartCount()}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 font-medium">Hi, {user.username}</span>
                                        <button
                                            onClick={handleLogout}
                                            className="text-xs font-bold text-red-500 hover:underline"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link to="/login" className="text-gray-700 hover:text-primary font-bold text-sm">Login</Link>
                                    <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-emerald-600 transition shadow-sm">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex items-center space-x-3">
                        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-700 hover:text-primary transition p-2">
                            <Search className="w-6 h-6" />
                        </button>
                        <Link to="/cart" className="relative text-gray-700 p-2">
                            <ShoppingCart className="w-6 h-6" />
                            {getCartCount() > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 focus:outline-none p-2 ml-1">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expandable Mobile/Tablet Search Bar */}
            <div className={`overflow-hidden transition-all duration-300 bg-white border-t ${isSearchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 py-3">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:bg-white"
                            autoFocus={isSearchOpen}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </form>
                </div>
            </div>

            {/* Mobile Sidebar Overlay (Backdrop) */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {/* Slide-out Mobile Menu (From Left) */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b flex flex-col space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-black text-primary italic">KAPZAR</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-gray-50 text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {user && (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800">{user.username}</span>
                                    <span className="text-xs text-gray-400">Verified Member</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-6 space-y-2 flex-grow overflow-y-auto">
                        <div className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">Navigation</div>
                        <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-4 p-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-primary transition-all font-bold"
                        >
                            <span>Home</span>
                        </Link>
                        <Link
                            to="/products"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-4 p-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-primary transition-all font-bold"
                        >
                            <span>All Products</span>
                        </Link>
                        {user?.is_staff && (
                            <Link
                                to="/admin"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center space-x-4 p-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all font-black"
                            >
                                <span>Admin Dashboard</span>
                            </Link>
                        )}

                        <div className="pt-8 mb-4 border-t mt-8">
                            <div className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">Account</div>
                            {user ? (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-4 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-bold"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Sign Out</span>
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center w-full p-3 rounded-xl border-2 border-primary text-primary font-black shadow-sm"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center w-full p-3 rounded-xl bg-primary text-white font-black shadow-lg"
                                    >
                                        Create Account
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
