function PageWrapper({ children }) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        padding: "40px",
        color: "white",
        backgroundColor: "#0B0F14",
      }}
    >
      {children}
    </div>
  );
}

export default PageWrapper;
