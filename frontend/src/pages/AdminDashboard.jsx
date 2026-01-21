import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AdminDashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('view_products'); // view_products | product | category

    // Data States
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    // Product Form
    const [prodData, setProdData] = useState({
        name: '', description: '', price: '', stock: '', category: '', image_url: '', available: true
    });

    // Category Form
    const [catData, setCatData] = useState({
        name: '', slug: '', image_url: ''
    });

    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!loading) {
            if (!user || !user.is_staff) {
                navigate('/');
            }
        }
    }, [user, loading, navigate]);

    const fetchCats = async () => {
        try {
            const res = await api.get('categories/');
            setCategories(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('products/');
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchCats();
        fetchProducts();
    }, []);

    const handleProdChange = (e) => setProdData({ ...prodData, [e.target.name]: e.target.value });
    const handleCatChange = (e) => setCatData({ ...catData, [e.target.name]: e.target.value });

    const createProduct = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            await api.post('products/create/', prodData);
            setMsg({ type: 'success', text: 'Product added successfully!' });
            setProdData({ name: '', description: '', price: '', stock: '', category: '', image_url: '', available: true });
            fetchProducts(); // Refresh list
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to add product.' });
        }
    };

    const createCategory = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            await api.post('categories/create/', catData);
            setMsg({ type: 'success', text: 'Category added successfully!' });
            setCatData({ name: '', slug: '', image_url: '' });
            fetchCats();
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to add category.' });
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`products/${id}/delete/`);
            setMsg({ type: 'success', text: 'Product deleted successfully!' });
            fetchProducts();
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to delete product.' });
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category? Warning: This will delete all products in it!")) return;
        try {
            await api.delete(`categories/${id}/delete/`);
            setMsg({ type: 'success', text: 'Category deleted successfully!' });
            fetchCats();
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to delete category.' });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('view_products')}
                        className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'view_products' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        View Products
                    </button>
                    <button
                        onClick={() => setActiveTab('view_categories')}
                        className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'view_categories' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        View Categories
                    </button>
                    <button
                        onClick={() => setActiveTab('product')}
                        className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'product' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Add Product
                    </button>
                    <button
                        onClick={() => setActiveTab('category')}
                        className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'category' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Add Category
                    </button>
                </div>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-lg mb-6 ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {msg.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                {activeTab === 'view_products' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6">All Products</h2>
                        <div className="overflow-x-auto pb-2">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="p-3">Image</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3">Stock</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <img src={p.image_url || 'https://via.placeholder.com/50'} alt={p.name} className="w-12 h-12 object-cover rounded" />
                                            </td>
                                            <td className="p-3 font-medium">{p.name}</td>
                                            <td className="p-3">₹{p.price}</td>
                                            <td className="p-3">{p.stock}</td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => deleteProduct(p.id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {products.length === 0 && <p className="text-center py-4 text-gray-500">No products found.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'view_categories' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6">All Categories</h2>
                        <div className="overflow-x-auto pb-2">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="p-3">Image</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Slug</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(c => (
                                        <tr key={c.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <img src={c.image_url || 'https://via.placeholder.com/50'} alt={c.name} className="w-12 h-12 object-cover rounded" />
                                            </td>
                                            <td className="p-3 font-medium">{c.name}</td>
                                            <td className="p-3 text-gray-500">{c.slug}</td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => deleteCategory(c.id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {categories.length === 0 && <p className="text-center py-4 text-gray-500">No categories found.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'product' && (
                    <form onSubmit={createProduct} className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" placeholder="Product Name" value={prodData.name} onChange={handleProdChange} className="border p-2 rounded" required />
                            <select name="category" value={prodData.category} onChange={handleProdChange} className="border p-2 rounded" required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="price" type="number" step="0.01" placeholder="Price" value={prodData.price} onChange={handleProdChange} className="w-full border p-2 rounded" required />
                            <input name="stock" type="number" placeholder="Stock Quantity" value={prodData.stock} onChange={handleProdChange} className="w-full border p-2 rounded" required />
                        </div>
                        <textarea name="description" placeholder="Description" value={prodData.description} onChange={handleProdChange} className="w-full border p-2 rounded" rows="3" />
                        <input name="image_url" placeholder="Image URL" value={prodData.image_url} onChange={handleProdChange} className="w-full border p-2 rounded" />
                        <button type="submit" className="w-full bg-primary text-white px-6 py-2 rounded hover:bg-emerald-600 font-bold">Save Product</button>
                    </form>
                )}

                {activeTab === 'category' && (
                    <form onSubmit={createCategory} className="space-y-4 max-w-lg mx-auto">
                        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
                        <input name="name" placeholder="Category Name" value={catData.name} onChange={handleCatChange} className="w-full border p-2 rounded" required />
                        <input name="slug" placeholder="Slug (unique-id, e.g. 'vegetables')" value={catData.slug} onChange={handleCatChange} className="w-full border p-2 rounded" required />
                        <input name="image_url" placeholder="Image URL" value={catData.image_url} onChange={handleCatChange} className="w-full border p-2 rounded" />
                        <button type="submit" className="w-full bg-primary text-white px-6 py-2 rounded hover:bg-emerald-600 font-bold">Save Category</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
