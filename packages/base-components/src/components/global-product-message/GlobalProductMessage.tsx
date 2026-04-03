const GlobalProductMessage = ({ message }: { message: string }) => {
  return (
    <div className="mb-3" data-test-selector="divGlobalProductMessage">
      {message}
    </div>
  );
};

export default GlobalProductMessage;
