import { supabase } from "../supabaseClient";
// ...otros imports...

const handleGoogleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) {
    // Puedes mostrar un toast o alerta
    alert("Error al iniciar sesión con Google: " + error.message);
  }
};

// ...en tu JSX:
<Button onClick={handleGoogleSignIn}>
  Iniciar sesión con Google
</Button>