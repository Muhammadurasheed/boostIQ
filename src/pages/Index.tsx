
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // We'll navigate to the dashboard instead of "/"
    navigate("/dashboard");
  }, [navigate]);

  return null;
};

export default Index;
