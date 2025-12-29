import Layout from "./Layout.jsx";

import Analytics from "./Analytics";

import Auth from "./Auth";

import Home from "./Home";

import JobRequests from "./JobRequests";

import MyProfile from "./MyProfile";

import PaymentError from "./PaymentError";

import PaymentSuccess from "./PaymentSuccess";

import ResetPassword from "./ResetPassword";

import WaiterProfile from "./WaiterProfile";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Analytics: Analytics,
    
    Auth: Auth,
    
    Home: Home,
    
    JobRequests: JobRequests,
    
    MyProfile: MyProfile,
    
    PaymentError: PaymentError,
    
    PaymentSuccess: PaymentSuccess,
    
    ResetPassword: ResetPassword,
    
    WaiterProfile: WaiterProfile,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Analytics />} />
                
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Auth" element={<Auth />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/JobRequests" element={<JobRequests />} />
                
                <Route path="/MyProfile" element={<MyProfile />} />
                
                <Route path="/PaymentError" element={<PaymentError />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/ResetPassword" element={<ResetPassword />} />
                
                <Route path="/WaiterProfile" element={<WaiterProfile />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}