package ma.projet.graph.entities;

import jakarta.persistence.Id;
import lombok.Data;

import java.util.Date;

@Data

public class TransactionRequest {
    private Long compteId;
    private double montant;
    private Date date;
    private TypeTransaction type;
}
