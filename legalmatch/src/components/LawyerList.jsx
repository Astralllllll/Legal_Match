import React, { useState, useEffect } from 'react';

function LawyerList() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The API call lives right inside the component that needs it
    fetch('http://localhost:5000/api/lawyers')
      .then(response => response.json())
      .then(data => {
        setLawyers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching lawyers:", error);
        setLoading(false);
      });
  }, []); // The empty array ensures this only runs once when the component loads

  if (loading) return <p>Loading lawyer profiles...</p>;

  return (
    <div>
      <h2>Available Legal Advocates</h2>
      <ul>
        {lawyers.map(lawyer => (
          <li key={lawyer.profile_id}>
            <strong>LSK Reg:</strong> {lawyer.lsk_registration_number} <br />
            <strong>Specialization:</strong> {lawyer.specializations}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LawyerList;