import { useEffect, useState } from "react";
import api from "./api/axios";
import { API_ENDPOINTS, withId } from "./api/endpoints";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import ilu from '../assets/mi_ilu.png';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [resolvedMiNo, setResolvedMiNo] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setAuthError("");
    });

    return () => unsubscribe();
  }, []);

  const getAuthMessage = (err) => {
    const code = err?.code || "";
    const messages = {
      "auth/popup-closed-by-user": "Google login popup was closed",
      "auth/network-request-failed": "Network error. Please try again",
    };

    return messages[code] || "Authentication failed. Please try again";
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    setAuthSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(getAuthMessage(err));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setCertificates([]);
    setResolvedMiNo("");
    setError("");
    await signOut(auth);
  };

  const fetchMyCertificates = async (authUser) => {
    if (!authUser) {
      return;
    }

    setError("");
    setCertificates([]);
    setResolvedMiNo("");

    setLoading(true);
    try {
      const token = await authUser.getIdToken();
      const res = await api.get(API_ENDPOINTS.CERTIFICATES_ME, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const certs = res.data?.certificates || [];
      setResolvedMiNo(res.data?.miNo || "");
      setCertificates(certs);
      if (!certs.length) {
        setError("No released certificates found for your MI number");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (entryId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await api.get(withId(API_ENDPOINTS.CERTIFICATES_DOWNLOAD, entryId), {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const blobUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `certificate_${resolvedMiNo || "student"}_${entryId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Download failed");
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyCertificates(user);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="page-shell">
        <main className="container">
          <div className="mi-ilu-container">
            <img src="/mi_ilu.png" alt="MI Illustration" className="mi-ilu" />
          </div>
          <section className="hero-card auth-card">
            <h1>Checking session...</h1>
            <p className="subtitle">Please wait while we verify your sign-in status.</p>
          </section>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell">
        <main className="container">
          <div className="mi-ilu-container">
            <img src={ilu} alt="MI Illustration" className="mi-ilu" />
          </div>
          <section className="hero-card auth-card">
            <p className="eyebrow">Certificate Portal</p>
            <h1>Login to continue</h1>
            <p className="subtitle">
              Sign in with your Google account.
            </p>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={authSubmitting}
            >
              Continue with Google
            </button>

            {authError && <p className="error-text">{authError}</p>}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <main className="container">
        <div className="mi-ilu-container">
          <img src={ilu} alt="MI Illustration" className="mi-ilu" />
        </div>
        <section className="user-bar">
          <p>
            Signed in as <strong>{user.email || user.displayName}</strong>
          </p>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </section>

        <section className="hero-card">
          <p className="eyebrow">Student Portal</p>
          <h1>Your Certificates</h1>
          <p className="subtitle">
            Certificates are auto-fetched from your email to MI mapping.
          </p>

          <button
            type="button"
            className="search-btn"
            onClick={() => fetchMyCertificates(user)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh My Certificates"}
          </button>

          {resolvedMiNo && <p className="resolved-mi">Mapped MI Number: {resolvedMiNo}</p>}

          {error && <p className="error-text">{error}</p>}
        </section>

        {certificates.length > 0 && (
          <section className="results-card">
            <div className="results-header">
              <h2>Your Certificates</h2>
              <span>{certificates.length} found</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Certificate Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((item) => (
                    <tr key={item.id}>
                      <td>{item.batch_name || "-"}</td>
                      <td>
                        <button
                          className="download-btn"
                          onClick={() => handleDownload(item.id)}
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
