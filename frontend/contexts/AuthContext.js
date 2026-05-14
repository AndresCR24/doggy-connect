"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usersApi, walkersApi, authApi } from "../lib/apiClient";

const AuthContext = createContext(null);
const STORAGE_KEY = "dc_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walkerProfile, setWalkerProfile] = useState(null);
  const [tokens, setTokens] = useState(null); // { access_token, id_token, refresh_token, expires_at }
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user ?? null);
        setWalkerProfile(parsed.walker ?? null);
        setTokens(parsed.tokens ?? null);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  function persist(userData, walkerData, tokenData) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: userData, walker: walkerData, tokens: tokenData })
    );
  }

  /**
   * login: autentica contra Cognito con email + contraseña.
   * Luego carga el perfil de usuario desde DynamoDB (microservicio users).
   */
  const login = useCallback(async (email, password) => {
    // 1. Autenticar contra Cognito
    const tokenData = await authApi.login(email, password);
    const expiresAt = Date.now() + tokenData.expires_in * 1000;
    const tokenPayload = { ...tokenData, expires_at: expiresAt };

    // 2. Obtener sub de Cognito para buscar el perfil en DynamoDB
    const cognitoUser = await authApi.me(tokenData.access_token);

    // 3. Buscar usuario en DynamoDB por email
    const users = await usersApi.list();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!found) {
      throw new Error("No se encontró perfil de usuario. Completa tu registro.");
    }

    // 4. Intentar cargar perfil de paseador
    let walker = null;
    try {
      const result = await walkersApi.getByUser(found.id);
      walker = Array.isArray(result) ? (result[0] ?? null) : result;
    } catch {
      walker = null;
    }

    setUser(found);
    setWalkerProfile(walker);
    setTokens(tokenPayload);
    persist(found, walker, tokenPayload);
    return found;
  }, []);

  const logout = useCallback(async () => {
    // Revocar tokens en Cognito si tenemos access_token
    if (tokens?.access_token) {
      try {
        await authApi.logout(tokens.access_token);
      } catch {
        // Ignorar errores de revocación (token ya expirado, etc.)
      }
    }
    setUser(null);
    setWalkerProfile(null);
    setTokens(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [tokens]);

  /** Refresca el access_token usando el refresh_token de Cognito */
  const refreshSession = useCallback(async () => {
    if (!tokens?.refresh_token) return null;
    try {
      const newTokens = await authApi.refresh(tokens.refresh_token);
      const expiresAt = Date.now() + newTokens.expires_in * 1000;
      const tokenPayload = { ...newTokens, refresh_token: tokens.refresh_token, expires_at: expiresAt };
      setTokens(tokenPayload);
      persist(user, walkerProfile, tokenPayload);
      return tokenPayload;
    } catch {
      // Refresh token expirado → cerrar sesión
      setUser(null);
      setWalkerProfile(null);
      setTokens(null);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, [tokens, user, walkerProfile]);

  /** Devuelve el access_token vigente, refrescándolo automáticamente si está por expirar */
  const getAccessToken = useCallback(async () => {
    if (!tokens) return null;
    // Refrescar si expira en menos de 5 minutos
    if (tokens.expires_at && Date.now() > tokens.expires_at - 5 * 60 * 1000) {
      const refreshed = await refreshSession();
      return refreshed?.access_token ?? null;
    }
    return tokens.access_token;
  }, [tokens, refreshSession]);

  /** Refresca datos del usuario desde DynamoDB */
  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const updated = await usersApi.get(user.id);
      setUser(updated);
      persist(updated, walkerProfile, tokens);
    } catch {}
  }, [user, walkerProfile, tokens]);

  /** Actualiza el usuario en memoria y localStorage sin llamar al API */
  const updateUser = useCallback(
    (updated) => {
      setUser(updated);
      persist(updated, walkerProfile, tokens);
    },
    [walkerProfile, tokens]
  );

  /** Actualiza el perfil de paseador en memoria y localStorage */
  const updateWalker = useCallback(
    (updated) => {
      setWalkerProfile(updated);
      persist(user, updated, tokens);
    },
    [user, tokens]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        walkerProfile,
        tokens,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshSession,
        getAccessToken,
        refreshUser,
        updateUser,
        updateWalker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
