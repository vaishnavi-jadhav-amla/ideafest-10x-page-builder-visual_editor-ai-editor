"use client";

export function PortalDataNotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ border: "0.2px solid #ededed", padding: "48px" }}>
        <svg fill="#000000" viewBox="0 0 492.426 492.426" height="50px" width="50px">
          <g>
            <g>
              <path d="M485.013,383.313l-191.9-328.3c-9.8-16.8-27.4-26.8-46.9-26.8s-37,10-46.9,26.8l-191.9,328.3 c-9.8,16.8-9.9,36.9-0.2,53.7c9.8,17,27.4,27.2,47.1,27.2h383.8c19.7,0,37.3-10.2,47.1-27.2 C494.913,420.213,494.813,400.113,485.013,383.313z M441.413,411.913c-0.7,1.2-1.8,1.8-3.3,1.8h-383.8c-1.5,0-2.6-0.6-3.3-1.8 c-0.9-1.5-0.3-2.6,0-3.1l191.9-328.3c0.7-1.2,1.8-1.8,3.3-1.8s2.6,0.6,3.3,1.8l191.9,328.3 C441.713,409.313,442.313,410.413,441.413,411.913z"></path>
            </g>
            <polygon points="264.013,330.213 228.413,330.213 223.413,165.613 269.013,165.613   "></polygon>
            <rect x="228.513" y="350.113" width="35.4" height="35.4"></rect>
          </g>
        </svg>
        <h1>Oops! Something went wrong here.</h1>

        <div>
          <p>These may be the possible reason:</p>
          <ul style={{ paddingLeft: "14px" }}>
            <li>API connectivity issue.</li>
          </ul>
          <p>Please contact the administrator for further assistance.</p>
        </div>
      </div>
    </div>
  );
}
