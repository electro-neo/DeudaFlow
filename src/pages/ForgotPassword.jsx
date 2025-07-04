import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña. / If the email is registered, you will receive a link to reset your password.");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", px: { xs: 1, sm: 2 } }}>
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" align="center" color="primary" fontWeight="bold" gutterBottom>
          Recuperar contraseña
        </Typography>
        <Typography align="center" color="text.secondary" mb={2}>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </Typography>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            {loading ? "Enviando..." : "Enviar enlace"}
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
