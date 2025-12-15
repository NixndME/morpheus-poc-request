# HPE Morpheus POC License Request Tool

An internal tool for managing Morpheus proof-of-concept license requests. Captures complete infrastructure details, tracks POC lifecycle, and provides insights for product engineering.

## 🎯 Purpose

This tool helps:
- **Pre-Sales Engineers** - Submit POC license requests with proper documentation
- **Partners & GSIs** - Request evaluation licenses for customer engagements
- **Sales Operations** - Track active POCs and monitor outcomes
- **Product Engineering** - Understand feature gaps from failed POCs

## ✨ Key Features

### Requestor Tracking
- Who is requesting (HPE SE, Partner, GSI, Distributor)
- Partner/Company affiliation
- Region assignment

### Customer Information
- Account name and industry
- Country and contact details
- Complete audit trail

### POC Details
- Use case description
- Business justification
- Duration control (45/60/90 days)
- Success criteria definition
- Auto-calculated end dates

### Infrastructure Capture
- **On-Premises**: Multi-datacenter support with all Morpheus hypervisors
- **Public Cloud**: All supported providers (AWS, Azure, GCP, etc.)
- **Kubernetes**: Worker node count with distribution selection

### POC Lifecycle Tracking
- Status: Draft → Pending Review → Approved → Active → Completed
- Outcome tracking: Success, Partial Success, Failed (with reasons)
- Feature gap capture for engineering feedback
- Competition analysis when lost to competitors

## 🚀 Running Locally

### Option 1: Docker (Recommended)
```bash
cd morpheus-wizard
docker-compose up --build
```
Open: http://localhost:3000

### Option 2: Node.js
```bash
cd morpheus-wizard
npm install
npm run dev
```
Open: http://localhost:5173

## 📦 Data Model

```json
{
  "id": "uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "requestor": {
    "name": "John Smith",
    "email": "john.smith@partner.com",
    "type": "partner-engineer",
    "company": "AC3",
    "region": "apac"
  },
  "customer": {
    "name": "Sydney Water Corporation",
    "industry": "government",
    "country": "Australia",
    "contactName": "Jane Doe",
    "contactEmail": "jane.doe@sydneywater.com.au"
  },
  "pocDetails": {
    "useCaseDescription": "VMware migration to Morpheus...",
    "businessJustification": "Cost reduction initiative...",
    "duration": 45,
    "startDate": "2024-01-15",
    "expectedEndDate": "2024-03-01",
    "successCriteria": "Successful VM migration..."
  },
  "datacenters": [...],
  "publicCloud": [...],
  "kubernetes": { "workers": 50, "distribution": "eks" },
  "calculations": {
    "onPremSockets": 24,
    "publicCloudSockets": 5,
    "kubernetesSockets": 5,
    "totalSockets": 34
  },
  "status": "Active",
  "outcomeDetails": {
    "outcome": "Pending",
    "featureGaps": [],
    "lessonsLearned": ""
  }
}
```

## 📊 Analytics Potential

With Supabase integration, you can:
- Track active POC count by region/partner
- Monitor POC success rates
- Identify common feature gaps
- Analyze competitor win/loss patterns
- Generate reports for management

## 🗄️ Database Setup

Schema ready at `supabase/schema.sql`. Apply to your Supabase project when ready for persistence.

## ☸️ Kubernetes Deployment

```bash
# Build and push to ECR
docker build -t morpheus-poc-tool .
docker tag morpheus-poc-tool:latest $ECR_REPO:latest
docker push $ECR_REPO:latest

# Deploy to EKS
kubectl apply -f k8s/deployment.yaml
```

---

**Internal Use Only** | HPE Morpheus Team
