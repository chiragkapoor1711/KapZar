import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <footer className="bg-white border-t py-6 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} KapZar Grocery. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
