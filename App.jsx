import { useEffect, useState } from "react";

// 1. These are your hardcoded keys
const App_ID = "1fdfcbf0";
const App_Key = "f309ffb7a8c8424822b1fe73609309d2";

export default function AdzunaJobs() {
  const [what, setWhat] = useState("developer");
  const [where, setWhere] = useState("london");
  const [country, setCountry] = useState("gb");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      // 2. Read directly from the constants defined above
      const appId = App_ID;
      const appKey = App_Key;
      
      const isPlaceholderKey = (value) => !value || value.startsWith("your_") || value.includes("PLACEHOLDER");

      if (!appId || !appKey || isPlaceholderKey(appId) || isPlaceholderKey(appKey)) {
        throw new Error(
          "Please check that valid App_ID and App_Key are supplied at the top of the file."
        );
      }

      const qs = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: "20",
        what,
        where,
      });
      
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${qs.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Adzuna error ${res.status}: ${body || res.statusText}`);
      }
      const data = await res.json();
      setJobs(data.results || []);
    } catch (err) {
      setError(err.message || "Fetch error");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", fontFamily: "sans-serif", padding: "0 1rem" }}>
      <h1>Adzuna Job Search</h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="What (role, skill)"
          style={{ flex: "1 1 220px", padding: "0.6rem" }}
        />
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder="Where (city or region)"
          style={{ flex: "0 0 180px", padding: "0.6rem" }}
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ padding: "0.6rem" }}
        >
          <option value="gb">UK (gb)</option>
          <option value="us">US (us)</option>
          <option value="au">Australia (au)</option>
          <option value="de">Germany (de)</option>
          <option value="fr">France (fr)</option>
          <option value="in">India (in)</option>
        </select>
        <button onClick={fetchJobs} style={{ padding: "0.6rem 1rem" }}>
          Search
        </button>
      </div>

      {loading && <p>Loading jobs…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && jobs.length === 0 && <p>No jobs found.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {jobs.map((job) => (
          <li key={job.id} style={{ borderBottom: "1px solid #eee", padding: "1rem 0" }}>
            <a
              href={job.redirect_url}
              target="_blank"
              rel="noreferrer noopener"
              style={{ fontSize: "1.05rem", fontWeight: 600 }}
            >
              {job.title}
            </a>
            <div style={{ color: "#555", marginTop: "0.25rem" }}>
              {job.company?.display_name} — {job.location?.display_name}
            </div>
            <div style={{ marginTop: "0.5rem", color: "#333" }}>
              {job.description ? `${job.description.replace(/<[^>]+>/g, '').slice(0, 300)}...` : "No description available."}
            </div>
            <div style={{ marginTop: "0.5rem", color: "#666" }}>
              {job.salary_min || job.salary_max ? `Salary: ${job.salary_min || '—'} - ${job.salary_max || '—'}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}