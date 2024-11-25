import './App.css';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import Modal from 'react-modal';

// Configuration du modal
Modal.setAppElement('#root');

const GET_ALL_COMPTES = gql`
  query {
    allComptes {
      id
      solde
      dateCreation
      type
    }
  }
`;

const ADD_COMPTE = gql`
  mutation SaveCompte($solde: Float!, $dateCreation: String!, $type: TypeCompte!) {
    saveCompte(compte: { solde: $solde, dateCreation: $dateCreation, type: $type }) {
      id
      solde
      dateCreation
      type
    }
  }
`;

const ADD_TRANSACTION = gql`
  mutation AddTransaction($compteId: ID!, $montant: Float!, $type: TypeTransaction!) {
    addTransaction(transactionRequest: { compteId: $compteId, montant: $montant, type: $type }) {
      id
      montant
      date
      type
    }
  }
`;

function App() {
  const { loading, error, data, refetch } = useQuery(GET_ALL_COMPTES);
  const [addCompte] = useMutation(ADD_COMPTE);
  const [addTransaction] = useMutation(ADD_TRANSACTION);

  const [formData, setFormData] = useState({ solde: '', dateCreation: '', type: 'COURANT' });
  const [selectedCompteId, setSelectedCompteId] = useState(null);
  const [transactionFormData, setTransactionFormData] = useState({ montant: '', type: 'DEPOT' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Etat pour ouvrir/fermer le modal

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormData({ ...transactionFormData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCompte({
        variables: {
          solde: parseFloat(formData.solde),
          dateCreation: formData.dateCreation.replace(/-/g, '/'),
          type: formData.type,
        },
      });
      refetch();
      setFormData({ solde: '', dateCreation: '', type: 'COURANT' });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Erreur : ${error.message}`);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompteId) {
      setErrorMessage('Veuillez sélectionner un compte pour ajouter une transaction.');
      return;
    }
    try {
      await addTransaction({
        variables: {
          compteId: selectedCompteId,
          montant: parseFloat(transactionFormData.montant),
          type: transactionFormData.type,
        },
      });
      refetch();
      setIsModalOpen(false); // Fermer le modal après la soumission
      setTransactionFormData({ montant: '', type: 'DEPOT' });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Erreur : ${error.message}`);
    }
  };

  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div>
      <h1 style={{textAlign:'center'}}>Gestion des Comptes</h1>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <div style={{ marginBottom: '20px' }}>
        
        <div style={{

          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '300px',
          margin: 'auto'
        }}>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <h2>Ajouter un Compte</h2>
            <input
              type="number"
              name="solde"
              placeholder="Solde"
              value={formData.solde}
              onChange={handleInputChange}
              required
              style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="date"
              name="dateCreation"
              value={formData.dateCreation}
              onChange={handleInputChange}
              required
              style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="COURANT">COURANT</option>
              <option value="EPARGNE">EPARGNE</option>
            </select>
            <button
              type="submit"
              style={{
                padding: '10px',
                backgroundColor: '#007BFF',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Ajouter Compte
            </button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {data.allComptes.map((compte) => (
          <div
            key={compte.id}
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h3>Compte #{compte.id}</h3>
            <p><strong>Solde:</strong> {compte.solde.toFixed(2)} €</p>
            <p><strong>Date de Création:</strong> {compte.dateCreation}</p>
            <p><strong>Type:</strong> {compte.type}</p>
            <button
              onClick={() => {
                setSelectedCompteId(compte.id);
                setIsModalOpen(true); // Ouvre le modal lorsque le bouton est cliqué
              }}
              style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#007BFF',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Ajouter Transaction
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Ajouter une Transaction"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            width: '300px',
          },
        }}
      >
        <h2>Ajouter une Transaction</h2>
        <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            type="number"
            name="montant"
            placeholder="Montant"
            value={transactionFormData.montant}
            onChange={handleTransactionChange}
            required
            style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <select
            name="type"
            value={transactionFormData.type}
            onChange={handleTransactionChange}
            style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="DEPOT">DEPOT</option>
            <option value="RETRAIT">RETRAIT</option>
          </select>
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#28A745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Ajouter Transaction
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default App;
