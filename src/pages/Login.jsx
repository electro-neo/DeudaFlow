import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const session = useSession();
  const user = useUser();

  // Redirige si ya hay sesión
  useEffect(() => {
    console.log("session", session);
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else {
      setError("");
      navigate("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    if (error) {
      setError("Error al iniciar sesión con Google: " + error.message);
    }
  };
  // Recupera manualmente la sesión tras el redirect OAuth
  useEffect(() => {
    // Solo ejecuta si no hay sesión detectada
    if (!session) {
      supabase.auth.getSession().then(({ data, error }) => {
        if (data?.session) {
          // Si hay sesión, navega al dashboard
          navigate("/dashboard");
        }
        if (error) {
          console.error("Error recuperando sesión tras OAuth:", error);
        }
      });
    }
  }, [session, navigate]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", px: { xs: 1, sm: 2 } }}>
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" align="center" color="primary" fontWeight="bold" gutterBottom>
          Iniciar sesión
        </Typography>
        <Typography align="center" color="text.secondary" mb={2}>
          Bienvenido a <span style={{ color: "#6366f1", fontWeight: 600 }}>Deuda Flow Control</span>.<br />
          {user ? (
            <span style={{ color: '#22c55e', fontWeight: 600 }}>
              ¡Bienvenido, {user.user_metadata?.full_name || user.email}!
            </span>
          ) : (
            <>Ingresa tus datos para continuar.</>
          )}
        </Typography>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 1, mb: 0.5, transition: 'all 0.2s' }}
            fullWidth
          >
            Iniciar sesión
          </Button>
          <Button
            variant="outlined"
            color="info"
            size="large"
            sx={{
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              transition: 'all 0.2s',
              borderColor: '#2563eb',
              color: '#2563eb',
              '&:hover': {
                backgroundColor: '#dbeafe',
                borderColor: '#2563eb',
                color: '#1d4ed8',
              },
            }}
            fullWidth
            onClick={async () => {
              setError("");
              // Puedes cambiar estos datos por los de un usuario demo real creado en tu Supabase
              const guestEmail = "invitado@demo.com";
              const guestPassword = "invitado123";
              const { error } = await supabase.auth.signInWithPassword({ email: guestEmail, password: guestPassword });
              if (error) setError("No se pudo iniciar sesión como invitado: " + error.message);
              else navigate("/dashboard");
            }}
          >
            Probar como invitado
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            sx={{
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              transition: 'all 0.2s',
              borderColor: '#ef4444',
              color: '#ef4444',
              '&:hover': {
                backgroundColor: '#fee2e2',
                borderColor: '#ef4444',
                color: '#b91c1c',
              },
            }}
            fullWidth
            onClick={handleGoogleSignIn}
          >
            <FcGoogle style={{ fontSize: 24, marginRight: 8 }} />
            Iniciar sesión con Google
          </Button>
          {error && <Typography color="error" align="center">{error}</Typography>}
        </form>
        <Typography align="center" mt={2}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "underline" }}>
            Regístrate aquí
          </Link>
        </Typography>
        <Typography align="center" mt={2}>
          <Link to="/forgot-password" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "underline" }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </Typography>
        {/* Sección de estado de sesión eliminada por limpieza visual */}
      </Paper>
    </Box>
  );
}