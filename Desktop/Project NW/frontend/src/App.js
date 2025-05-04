import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Composants de mise en page
import Layout from './components/layout/Layout';

// Pages d'authentification
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages principales
import Home from './pages/Home';
import Profile from './pages/Profile';

// Pages des terrains
import TerrainsList from './pages/terrains/TerrainsList';
import TerrainCreate from './pages/terrains/TerrainCreate';
import TerrainEdit from './pages/terrains/TerrainEdit';

// Pages des événements
import EventsList from './pages/events/EventsList';
import EventCreate from './pages/events/EventCreate';
import EventEdit from './pages/events/EventEdit';
import EventDetails from './pages/events/EventDetails';

// Pages des inscriptions
import RegistrationsList from './pages/registrations/RegistrationsList';

// Pages de chat
import Chat from './pages/chat/Chat';

// Contexte d'authentification
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes protégées */}
              <Route path="/profile" element={<Profile />} />
              
              {/* Routes des terrains */}
              <Route path="/terrains" element={<TerrainsList />} />
              <Route path="/terrains/create" element={<TerrainCreate />} />
              <Route path="/terrains/edit/:id" element={<TerrainEdit />} />
              
              {/* Routes des événements */}
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/create" element={<EventCreate />} />
              <Route path="/events/edit/:id" element={<EventEdit />} />
              <Route path="/events/:id" element={<EventDetails />} />
              
              {/* Routes des inscriptions */}
              <Route path="/registrations" element={<RegistrationsList />} />
              
              {/* Routes du chat */}
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 