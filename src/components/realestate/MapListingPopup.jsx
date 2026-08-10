import React from "react";

// Pop-up obsah pre inzerát na mape – foto, cena a základné parametre
export default function MapListingPopup({ listing, typeLabel, color, onInterest }) {
  const isRent = listing.typ_ponuky === "prenajom";
  const cena = `${Math.round(listing.cena).toLocaleString("sk-SK")} €${isRent ? " / mes." : ""}`;

  return (
    <div style={{ minWidth: 210, maxWidth: 230 }}>
      {listing.fotky?.[0] && (
        <img
          src={listing.fotky[0]}
          alt={listing.nazov}
          style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 8, marginBottom: 6 }}
        />
      )}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
        <span style={{ background: color, color: "#0f172a", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>
          {typeLabel}
        </span>
        <span style={{ background: isRent ? "#0ea5e9" : "#10b981", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>
          {isRent ? "Prenájom" : "Predaj"}
        </span>
      </div>
      <strong style={{ fontSize: 13, display: "block" }}>{listing.nazov}</strong>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#b45309", margin: "2px 0" }}>{cena}</div>
      <p style={{ margin: "2px 0", fontSize: 11, color: "#475569" }}>
        {[
          listing.mesto,
          listing.plocha ? `${listing.plocha} m²` : null,
          listing.pocet_izieb ? `${listing.pocet_izieb} izb.` : null,
        ].filter(Boolean).join(" · ")}
      </p>
      {isRent && listing.depozit ? (
        <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>
          Depozit {Math.round(listing.depozit).toLocaleString("sk-SK")} €
          {listing.energie_v_cene ? " · energie v cene" : ""}
        </p>
      ) : null}
      {onInterest && (
        <button
          onClick={() => onInterest(listing)}
          style={{ marginTop: 6, width: "100%", background: "#7e22ce", color: "#fff", fontWeight: 700, fontSize: 12, padding: "6px 8px", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Mám záujem →
        </button>
      )}
    </div>
  );
}