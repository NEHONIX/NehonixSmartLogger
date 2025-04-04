export const renderConnectionStatus = (props: {
  isConnected: boolean;
  isAuthenticated: boolean;
  connectionError?: string;
}) => {
  const { isConnected, isAuthenticated, connectionError } = props;
  return (
    <div className="connection-status">
      <span
        className={`status-indicator ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "connected" : "disconnected"}
      </span>
      <span
        className={`status-indicator ${
          isAuthenticated ? "authenticated" : "not-authenticated"
        }`}
      >
        {isAuthenticated ? "authenticated" : "not-authenticated"}
      </span>
      {connectionError && (
        <span className="status-indicator error" title={connectionError}>
          Error
        </span>
      )}
    </div>
  );
};
