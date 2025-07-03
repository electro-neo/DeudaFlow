import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const session = useSession();

  // Redirige si ya hay sesión
  useEffect(() => {
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
    });
    if (error) {
      setError("Error al iniciar sesión con Google: " + error.message);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" align="center" color="primary" fontWeight="bold" gutterBottom>
          Iniciar sesión
        </Typography>
        <Typography align="center" color="text.secondary" mb={2}>
          Bienvenido a <span style={{ color: "#6366f1", fontWeight: 600 }}>Deuda Flow Control</span>. Ingresa tus datos para continuar.
        </Typography>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            fullWidth
          >
            Iniciar sesión
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            sx={{ mt: 2 }}
            fullWidth
            onClick={handleGoogleSignIn}
          >
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
      </Paper>
    </Box>
  );
}