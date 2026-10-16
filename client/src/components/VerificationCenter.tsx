import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileCheck2, LockKeyhole, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const documentTypes = [
  ["identity", "Identity document"], ["seller_authorization", "Seller authorization"], ["ownership_evidence", "Ownership evidence"], ["title_search", "Title-search information"], ["tenure", "Tenure details"], ["survey", "Survey information"], ["plot_dimensions", "Plot dimensions"], ["boundary_document", "Boundary documentation"], ["legal_check", "Additional legal check"],
] as const;
const statusText: Record<string, string> = { not_started: "Not started", submitted: "Submitted", in_review: "In review", completed: "Completed", approved: "Approved", rejected: "Needs correction", uploaded: "Uploaded" };

export default function VerificationCenter() {
  const overview = trpc.seller.verificationOverview.useQuery();
  const workspace = trpc.seller.workspace.useQuery();
  const upload = trpc.seller.uploadVerificationDocument.useMutation({ onSuccess: () => { overview.refetch(); toast.success("Private document uploaded for review"); } });
  const [docType, setDocType] = useState<(typeof documentTypes)[number][0]>("identity");
  const [listingId, setListingId] = useState("");
  const [uploading, setUploading] = useState(false);
  const checks = overview.data?.checks;

  const uploadFile = async (file: File) => {
    if (!file.type.match(/^(application\/pdf|image\/(jpeg|png|webp))$/)) { toast.error("Use PDF, JPG, PNG, or WEBP files only."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Files must be 10MB or smaller."); return; }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read file")); reader.readAsDataURL(file); });
      await upload.mutateAsync({ docType, listingId: listingId ? Number(listingId) : null, fileName: file.name, contentType: file.type as "application/pdf" | "image/jpeg" | "image/png" | "image/webp", base64: dataUrl.split(",")[1] || "" });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed"); } finally { setUploading(false); }
  };

  const checkRows = [
    ["Identity verified", checks?.identityStatus || "not_started", "Confirms the account holder's identity."],
    ["Seller authorization reviewed", checks?.authorizationStatus || "not_started", "Confirms the right to market property or represent an owner."],
    ["Property documentation reviewed", checks?.propertyDocsStatus || "not_started", "Confirms documents were received and reviewed; it is not an independent guarantee."],
    ["Additional legal or land checks", checks?.legalChecksStatus || "not_started", "Only marked complete when the appropriate check has actually been recorded."],
  ];
  return <section className="verification-center"><div className="verification-intro"><div><p className="eyebrow">TRUST & PROPERTY VERIFICATION</p><h2>Show customers what has actually been checked.</h2><p>Upload evidence privately. A&O will record each review separately—nothing is represented as independently authenticated until an authorized reviewer completes that check.</p></div><div className="private-doc-badge"><LockKeyhole size={17} /><span><strong>Private evidence</strong><small>Never shown on public listings</small></span></div></div><div className="verification-check-grid">{checkRows.map(([label, status, description]) => <div className="verification-check-card" key={label}><span className={status === "completed" ? "check-icon complete" : "check-icon"}>{status === "completed" ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}</span><div><strong>{label}</strong><b>{statusText[status] || status}</b><p>{description}</p></div></div>)}</div><div className="verification-upload-layout"><div className="dashboard-panel verification-upload-panel"><div className="panel-title"><h3>Upload verification evidence</h3><FileCheck2 size={18} /></div><p className="panel-help">Choose the specific check this document supports. For land, you can submit title-search information, tenure, survey, dimensions, and boundary documents separately.</p><label>Document type<select value={docType} onChange={(event) => setDocType(event.target.value as typeof docType)}>{documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Related listing (optional)<select value={listingId} onChange={(event) => setListingId(event.target.value)}><option value="">Account-level evidence</option>{workspace.data?.listings.map((listing) => <option value={listing.id} key={listing.id}>{listing.title}</option>)}</select></label><label className="private-upload-drop"><UploadCloud size={23} /><strong>{uploading ? "Uploading securely…" : "Choose a private file"}</strong><small>PDF, JPG, PNG, WEBP · maximum 10MB</small><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); }} /></label><div className="verification-safety-note"><AlertTriangle size={16} /><p>Documents are retained for review controls and are not public listing assets. Do not upload passwords, payment cards, or unrelated personal data.</p></div></div><div className="dashboard-panel"><div className="panel-title"><h3>Submitted documents</h3><span>{overview.data?.documents.length || 0}</span></div><div className="document-list">{overview.data?.documents.map((document) => <div className="document-row" key={document.id}><FileCheck2 size={16} /><div><strong>{document.fileName}</strong><small>{documentTypes.find(([value]) => value === document.docType)?.[1] || document.docType} · {Math.ceil(document.byteSize / 1024)} KB</small></div><span className={`document-status document-${document.status}`}>{statusText[document.status]}</span></div>)}{!overview.data?.documents.length && <div className="empty-panel"><FileCheck2 size={21} /><p>No evidence uploaded yet.</p></div>}</div></div></div><div className="verification-disclaimer"><AlertTriangle size={16} /><p><strong>Safety guidance:</strong> A published listing, verification badge, or uploaded document does not guarantee ownership, legal validity, title, or a successful transaction. Always complete your own checks and never pay before verifying the property and seller.</p></div></section>;
}
