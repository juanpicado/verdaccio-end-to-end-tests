import React from 'react';

export const Page = () => (
  <>
    <main>
      <h1 className="title" data-testid="title">
        Welcome to <a href="https://nextjs.org">React Finland 2021!</a>
      </h1>

      <p className="description">
        Get started by editing <code>pages/index.js</code>
      </p>

      <div className="grid">
        <a href="https://react-finland.fi/schedule/" className="card" data-testid="card1">
          <h3>Schedule &rarr;</h3>
          <p>React Finland 2021 will take place between 30th of August and 3rd of September.</p>
        </a>

        <a href="https://react-finland.fi/speakers" className="card" data-testid="card2">
          <h3>Speakers &rarr;</h3>
          <p>The sessions take ~1.5h and there's a 15 minute slot to demo and present for each speaker!</p>
        </a>

        <a
          href="https://react-finland.fi/workshops/"
          className="card"
          data-testid="card3"
        >
          <h3>Workshops &rarr;</h3>
          <p>All the workshops take place online.</p>
        </a>

        <a
          href="https://react-finland.fi/for-attendees/"
          className="card"
          data-testid="card4"
        >
          <h3>For Attendees &rarr;</h3>
          <p>
           Welcome to React Finland 2021
          </p>
        </a>
      </div>
    </main>
    <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Arial;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>
  </>
);
