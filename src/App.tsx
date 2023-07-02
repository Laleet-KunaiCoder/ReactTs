import React, { useState } from "react";
import "./App.css";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

const App: React.FC = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [registrationResponse, setRegistrationResponse] = useState(null);
  const [authenticationResponse, setAuthenticationResponse] = useState(null);
  const [registrationBody, setRegistrationBody] = useState(null);
  const [authenticationBody, setAuthenticationBody] = useState(null);

  const handleUsernameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError(""); // Clear any previous error message
    setRegistrationResponse(null); // Clear registration response
    setAuthenticationResponse(null); // Clear authentication response
    setRegistrationBody(null); // Clear registration body
    setAuthenticationBody(null); // Clear authentication body
    setUsername(event.target.value);
  };

  const handleRegistration = async () => {
    if (!username) {
      setError("Please enter a username."); // Display error if username is empty
      return;
    }

    try {
      const resp = await fetch(
        `http://localhost:8080/generate-registration-options?username=${username}`
      );
      const responseObject = await resp.json();
      setRegistrationResponse(responseObject); // Store registration response
      const attResp = await startRegistration(responseObject);

      const verificationResp = await fetch(
        "http://localhost:8080/verify-registration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attestationResponse: attResp,
            user: responseObject.user,
          }),
        }
      );

      const verificationJSON = await verificationResp.json();
      if (verificationJSON && verificationJSON.verified) {
        console.log("Registration success");
      }
      setRegistrationBody({
        attestationResponse: attResp,
        user: responseObject.user,
      }); // Store registration body
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.log(error);
    }
  };

  const handleAuthentication = async () => {
    if (!username) {
      setError("Please enter a username."); // Display error if username is empty
      return;
    }

    try {
      const resp = await fetch(
        `http://localhost:8080/generate-authentication-options?username=${username}`
      );
      const responseObject = await resp.json();
      setAuthenticationResponse(responseObject); // Store authentication response
      let asseResp;

      try {
        asseResp = await startAuthentication(responseObject.options);
      } catch (error) {
        throw error;
      }

      const verificationResp = await fetch(
        "http://localhost:8080/verify-authentication",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attestationResponse: asseResp,
            user: responseObject.user,
          }),
        }
      );

      const verificationJSON = await verificationResp.json();
      if (verificationJSON && verificationJSON.verified) {
        console.log("Authentication success");
      }
      setAuthenticationBody({
        attestationResponse: asseResp,
        user: responseObject.user,
      }); // Store authentication body
    } catch (error) {
      setError("Authentication failed. Please try again.");
      console.log(error);
    }
  };

  return (
    <div className="container">
    <input
      type="text"
      value={username}
      onChange={handleUsernameChange}
      placeholder="Enter username"
      className="input"
    />
   <div className="button-container">
        <button onClick={handleRegistration} className="button">
          Register
        </button>
        <button onClick={handleAuthentication} className="button">
          Authenticate
        </button>
      </div>
    {error && <div className="error">{error}</div>}
    <div className="response-container">
      {registrationResponse && (
        <div className="response">
          <div className="response-title">Registration Response:</div>
          <pre>{JSON.stringify(registrationResponse, null, 2)}</pre>
        </div>
      )}
      {authenticationResponse && (
        <div className="response">
          <div className="response-title">Authentication Response:</div>
          <pre>{JSON.stringify(authenticationResponse, null, 2)}</pre>
        </div>
      )}
      {registrationBody && (
        <div className="response">
          <div className="response-title">Registration Body:</div>
          <pre>{JSON.stringify(registrationBody, null, 2)}</pre>
        </div>
      )}
      {authenticationBody && (
        <div className="response">
          <div className="response-title">Authentication Body:</div>
          <pre>{JSON.stringify(authenticationBody, null, 2)}</pre>
        </div>
      )}
    </div>
  </div>
  );
};

export default App;
