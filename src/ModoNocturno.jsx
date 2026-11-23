import React, { createContext, useContext, useState } from "react";

const ModoNocturnoContext = createContext(null);

export function ModoNocturnoProvider({ children }) {
  const [modoNocturno, setModoNocturno] = useState(false);

  return (
    <ModoNocturnoContext.Provider value={{ modoNocturno, setModoNocturno }}>
      <div className={modoNocturno ? "app night-mode" : "app"}>{children}</div>
    </ModoNocturnoContext.Provider>
  );
}

export function useModoNocturno() {
  return useContext(ModoNocturnoContext);
}
