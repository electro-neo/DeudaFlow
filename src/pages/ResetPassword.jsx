import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Si el enlace es inválido o expiró, cerrar sesión y redirigir a login
  useEffect(() => {
    const hash = location.hash;
    if (hash.includes('error=') || hash.includes('otp_expired') || hash.includes('access_denied')) {
      supabase.auth.signOut().then(() => {
        navigate("/login");
      });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setMessage("¡Contraseña actualizada correctamente! Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" align="center" color="primary" fontWeight="bold" gutterBottom>
          Restablecer contraseña
        </Typography>
        <Typography align="center" color="text.secondary" mb={2}>
          Ingresa tu nueva contraseña.
        </Typography>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField
            label="Nueva contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
          {error && <Typography color="error" align="center">{error}</Typography>}
          {message && <Typography color="success.main" align="center">{message}</Typography>}
        </form>
        <Typography align="center" mt={2}>
          <Link to="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "underline" }}>
            Volver al login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
