import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setSuccess("¡Registro exitoso! Revisa tu correo para confirmar.");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography
          variant="h4"
          align="center"
          color="primary"
          fontWeight="bold"
          gutterBottom
        >
          Registro de Usuario
        </Typography>
        <Typography align="center" color="text.secondary" mb={2}>
          Crea tu cuenta para comenzar a usar{" "}
          <span
            style={{
              color: "#6366f1",
              fontWeight: 600,
            }}
          >
            Deuda Flow Control
          </span>
          .
        </Typography>
        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Registrarse
          </Button>
          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" align="center">
              {success}
            </Typography>
          )}
        </form>
        <Typography align="center" mt={2}>
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            style={{
              color: "#6366f1",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Inicia sesión aquí
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}