import React from 'react';
import VolunteerMatchingForm from './components/VolunteerMatchingForm';
import VolunteerHistory from './components/VolunteerHistory';

function App() {
  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Dashboard</h1>

      <section>
        <VolunteerMatchingForm />
      </section>

      <hr style={{ margin: '40px 0' }} />

      <section>
        <VolunteerHistory />
      </section>
    </div>
  );
}

export default App;
