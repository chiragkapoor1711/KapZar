import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import QRCode from 'qrcode';

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [qrCode, setQrCode] = useState('');
    const [txnId, setTxnId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`orders/${orderId}/`);
                setOrder(res.data);

                // Generate UPI URI
                const upiParams = new URLSearchParams({
                    pa: "kapoorchirag424@oksbi",
                    pn: "KapZar Store",
                    tn: `Order ${res.data.id} payment`,
                    am: res.data.total,
                    cu: "INR",
                });
                const upiUri = `upi://pay?${upiParams.toString()}`;

                // Generate QR
                const qr = await QRCode.toDataURL(upiUri);
                setQrCode(qr);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleConfirm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`orders/${orderId}/pay/`, { txn_id: txnId });
            alert("Payment Confirmed! Thank you.");
            navigate('/');
        } catch (err) {
            console.error(err);
            alert("Failed to confirm payment.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!order) return <div className="text-center py-12">Order not found.</div>;

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment</h2>
            <p className="text-gray-500 mb-6">Order #{order.id}</p>

            <div className="mb-8">
                <p className="font-bold text-3xl text-primary mb-4">₹{order.total}</p>
                <div className="flex justify-center mb-4">
                    {qrCode && <img src={qrCode} alt="Payment QR" className="w-48 h-48" />}
                </div>
                <p className="text-sm text-gray-500">Scan using any UPI App</p>
                <p className="text-xs text-gray-400 mt-1">UPI ID: kapoorchirag424@oksbi</p>
            </div>

            <form onSubmit={handleConfirm} className="text-left space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter Transaction ID (UTR)</label>
                    <input
                        type="text"
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        placeholder="e.g. 123456789012"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition shadow-md disabled:bg-gray-400"
                >
                    {submitting ? 'Confirming...' : 'I have made the payment'}
                </button>
            </form>
        </div>
    );
};

export default Payment;
