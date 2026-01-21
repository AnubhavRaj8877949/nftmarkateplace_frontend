import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Providers } from './Providers';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Create from './pages/Create';
import Profile from './pages/Profile';
import NFTDetail from './pages/NFTDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Providers>
        <div className="min-h-screen bg-[#0f172a] text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Home />} />
              <Route path="/create" element={
                <ProtectedRoute>
                  <Create />
                </ProtectedRoute>
              } />
              <Route path="/profile/:address" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/nft/:contractAddress/:tokenId" element={<NFTDetail />} />
            </Routes>
          </main>
        </div>
      </Providers>
    </Router>
  );
}

export default App;
