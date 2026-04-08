import React, { useEffect, useState } from "react";
import "./Orderlist.css";
import toast, { Toaster } from "react-hot-toast";

function OrderList({ onSave, onClose, selectedPayments }) {
  // 1. Initial Data Setup
  const [vendors] = useState([
    { name: "VEL HARDWARES", id: "V001" },
    { name: "WOOD COMPANY", id: "V002" },
    { name: "HARSHIT TECH", id: "V003" },
  ]);

  const [allBills] = useState([
    {
      id: "#19129",
      vendor: "VEL HARDWARES",
      site: "N/A",
      date: "23-10-2025",
      billAmount: 30879,
      outstanding: 30879,
    },
    {
      id: "#15321",
      vendor: "VEL HARDWARES",
      site: "N/A",
      date: "27-01-2026",
      billAmount: 1340,
      outstanding: 1340,
    },
    {
      id: "#20202",
      vendor: "WOOD COMPANY",
      site: "N/A",
      date: "05-02-2026",
      billAmount: 10000,
      outstanding: 10000,
    },

    {
      id: "#16321",
      vendor: "WOOD COMPANY",
      site: "N/A",
      date: "27-01-2026",
      billAmount: 20000,
      outstanding: 20000,
    },

    {
      id: "#11321",
      vendor: "WOOD COMPANY",
      site: "N/A",
      date: "27-01-2026",
      billAmount: 13000,
      outstanding: 13000,
    },

    {
      id: "#32321",
      vendor: "HARSHIT TECH",
      site: "N/A",
      date: "27-01-2026",
      billAmount: 18000,
      outstanding: 18000,
    },

    {
      id: "#31351",
      vendor: "HARSHIT TECH",
      site: "N/A",
      date: "27-01-2026",
      billAmount: 18000,
      outstanding: 18000,
    },
  ]);

 
  const [formData, setFormData] = useState({
    formDate: "2026-04-07",
    reference: "",
    formType: "Project",
    adjustingType: "Against Bills",
    source: "MSP Cash",
    project: "All Projects",
    site: "N/A",
    costType: "Materials",
    vendor: "",
    narration: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedBillData, setSelectedBillData] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("payment_records")) || [];
    setPaymentHistory(saved);
  }, []);

  useEffect(() => {
    if (selectedPayments) {
      setFormData({
        formDate: selectedPayments.formDate,
        reference: selectedPayments.reference,
        formType: selectedPayments.formType,
        adjustingType: selectedPayments.adjustingType,
        source: selectedPayments.source,
        project: selectedPayments.project,
        site: selectedPayments.site,
        costType: selectedPayments.costType,
        vendor: selectedPayments.vendor,
        narration: selectedPayments.narration,
      });

      setTimeout(() => {
        const mappedBills = {};
        selectedPayments.bills.forEach((b) => {
          mappedBills[b.billId] = {
            billAmount: b.billAmount,
            outstanding: b.outstanding,
            paid: b.paidAmount,
            paymentType: b.paymentType,
            error: "",
          };
        });

        setSelectedBillData(mappedBills);
      }, 0);
    }
  }, [selectedPayments]);

  useEffect(() => {
    if (formData.vendor) {
      const matched = allBills.filter(
        (bill) => bill.vendor === formData.vendor,
      );
      setFilteredBills(matched);
    } else {
      setFilteredBills([]);
      setSelectedBillData({});
    }
  }, [formData.vendor, allBills]);

 
  const handleToggle = (billId, isChecked, billAmt, osAmt) => {
    const updated = { ...selectedBillData };
    if (isChecked) {
      updated[billId] = {
        billAmount: billAmt,
        outstanding: osAmt,
        paid: osAmt,
        paymentType: "Full Payment",
        error: "",
      };
    } else {
      delete updated[billId];
    }
    setSelectedBillData(updated);
  };

  const handlePaymentTypeChange = (billId, paymentType) => {
    const updated = { ...selectedBillData };
    if (updated[billId]) {
      updated[billId].paymentType = paymentType;
      if (paymentType === "Full Payment") {
        updated[billId].paid = updated[billId].outstanding;
        updated[billId].error = "";
      } else {
        updated[billId].paid = "";
        updated[billId].error = "";
      }
      setSelectedBillData(updated);
    }
  };

  const handleAmountChange = (billId, val) => {
  const updated = { ...selectedBillData };

  if (updated[billId]) {
    let amount = parseFloat(val);

    // Handle empty input
    if (val === "") {
      updated[billId].paid = "";
      updated[billId].error = "";
      setSelectedBillData(updated);
      return;
    }

    if (isNaN(amount)) {
      updated[billId].paid = "";
      updated[billId].error = "Enter a valid number";
      setSelectedBillData(updated);
      return;
    }

    updated[billId].paid = amount;

   
    if (updated[billId].paymentType === "Partial Payment") {
      if (amount > updated[billId].outstanding) {
        updated[billId].error = `Partial payment cannot exceed ₹${updated[billId].outstanding}`;
      } else if (amount <= 0) {
        updated[billId].error = "Enter a valid amount";
      } else {
        updated[billId].error = "";
      }
    }

    setSelectedBillData(updated);
  }
};

  const sumOfBills = Object.values(selectedBillData).reduce(
    (s, b) => s + b.billAmount,
    0,
  );
  const sumOfOS = Object.values(selectedBillData).reduce(
    (s, b) => s + b.outstanding,
    0,
  );
  const totalSettlement = Object.values(selectedBillData).reduce(
  (s, b) => s + (parseFloat(b.paid) || 0),
  0
);

  const validateForm = () => {
    const errors = {};

    if (!formData.formDate) errors.formDate = "Date is required";
    if (!formData.reference) errors.reference = "Reference is required";
    if (!formData.vendor) errors.vendor = "Vendor is required";
    if (formData.formType === "Project" && !formData.project)
      errors.project = "Project is required";
    if (Object.values(selectedBillData).length === 0)
      errors.bills = "Select at least one bill";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const paymentRecord = {
      id: Date.now(),
      ...formData,
      bills: Object.entries(selectedBillData).map(([billId, data]) => ({
        billId,
        billAmount: data.billAmount,
        outstanding: data.outstanding,
        paymentType: data.paymentType,
        paidAmount: data.paid,
      })),
      totalSettlement,
      sumOfBills,
      sumOfOS,
    };

    const existing = JSON.parse(localStorage.getItem("payment_records")) || [];
    localStorage.setItem(
      "payment_records",
      JSON.stringify([...existing, paymentRecord]),
    );

    toast.success("Payment saved successfully");
    setFormData({
      formDate: "2026-04-07",
      reference: "",
      formType: "Project",
      adjustingType: "Against Bills",
      source: "MSP Cash",
      project: "All Projects",
      site: "N/A",
      costType: "Materials",
      vendor: "",
      narration: "",
    });
    setSelectedBillData({});

    if (onSave) onSave();
  };

  return (
    <div className="container-fluid py-4  min-vh-100">
      <Toaster />
      <div
        className={`card shadow-lg border-0 mx-auto payment-card ${filteredBills.length > 0 ? "" : "compact"}`}
      >
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary fw-bold">Add Payment</h5>
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              style={{ cursor: "pointer" }}
            ></button>
          </div>
        </div>

        <div className="card-body ">
          <div className="row g-0">
            <div
              className={`${filteredBills.length > 0 ? "col-md-5 border-end" : "col-md-12"} form-section`}
            >
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">
                    Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control form-control-sm ${formErrors.formDate ? "border-danger" : ""}`}
                    value={formData.formDate}
                    onChange={(e) =>
                      handleInputChange("formDate", e.target.value)
                    }
                  />
                  {formErrors.formDate && (
                    <div className="text-danger small mt-1">
                      {formErrors.formDate}
                    </div>
                  )}
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">
                    Reference <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-sm ${formErrors.reference ? "border-danger" : ""}`}
                    placeholder="Ref No"
                    value={formData.reference}
                    onChange={(e) =>
                      handleInputChange("reference", e.target.value)
                    }
                  />
                  {formErrors.reference && (
                    <div className="text-danger small mt-1">
                      {formErrors.reference}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <div className="d-flex gap-3 radio-btns justify-content-center  rounded p-2 bg-white">
                    {["Project", "General", "Equipment"].map((t) => (
                      <div key={t} className="form-check m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="mainType"
                          checked={formData.formType === t}
                          onChange={() => handleInputChange("formType", t)}
                        />
                        <label className="form-check-label small fw-bold">
                          {t}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-12 ">
                  <label className="form-label text-muted small fw-bold">
                    Adjusting Type
                  </label>
                  <div className="d-flex gap-2 adjusting-btn">
                    {["Against Bills", "Advances", "Petty Bills"].map(
                      (type) => (
                        <button
                          key={type}
                          className={`btn btn-sm  flex-fill fw-bold ${formData.adjustingType === type ? "btn-primary  text-white" : "bg-light"}`}
                          onClick={() =>
                            handleInputChange("adjustingType", type)
                          }
                        >
                          {type}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">
                    Source
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.source}
                    onChange={(e) =>
                      handleInputChange("source", e.target.value)
                    }
                  >
                    <option>MSP Cash</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                {formData.formType === "Project" && (
                  <>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">
                        Project <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select form-select-sm ${formErrors.project ? "border-danger" : ""}`}
                        value={formData.project}
                        onChange={(e) =>
                          handleInputChange("project", e.target.value)
                        }
                      >
                        <option>All</option>
                      </select>
                      {formErrors.project && (
                        <div className="text-danger small mt-1">
                          {formErrors.project}
                        </div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">
                        Site <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.site}
                        onChange={(e) =>
                          handleInputChange("site", e.target.value)
                        }
                        disabled
                      >
                        <option>N/A</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">
                    Cost Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.costType}
                    onChange={(e) =>
                      handleInputChange("costType", e.target.value)
                    }
                  >
                    <option>Materials</option>
                    <option>Electricity</option>
                    <option>Labour</option>
                    <option>Transport</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">
                    Vendor <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select border-primary fw-bold form-select-sm ${formErrors.vendor ? "border-danger" : ""}`}
                    value={formData.vendor}
                    onChange={(e) =>
                      handleInputChange("vendor", e.target.value)
                    }
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v, i) => (
                      <option key={i} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.vendor && (
                    <div className="text-danger small mt-1">
                      {formErrors.vendor}
                    </div>
                  )}
                </div>

                {/* 8. Narration */}
                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">
                    Narration
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="Enter details..."
                    value={formData.narration}
                    onChange={(e) =>
                      handleInputChange("narration", e.target.value)
                    }
                  ></textarea>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: BILL MODAL  */}
            {filteredBills.length > 0 && (
              <div className="col-md-7 p-4 bg-white d-flex flex-column border-start bills-section">
                <h6 className="fw-bold mb-3 border-bottom pb-2">
                  Outstanding Bills: {formData.vendor}
                </h6>
                <div className="flex-grow-1 overflow-auto pe-2">
                  {filteredBills.map((bill, index) => (
                    <div key={index}>
                      <div className="d-flex justify-content-end mb-2">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            onChange={(e) =>
                              handleToggle(
                                bill.id,
                                e.target.checked,
                                bill.billAmount,
                                bill.outstanding,
                              )
                            }
                          />
                          <label className="form-check-label small fw-bold">
                            Select Bill
                          </label>
                        </div>
                      </div>

                      <table
                        className={`table border-0 bill-card-table ${selectedBillData[bill.id] ? "selected" : ""}`}
                      >
                        <tbody>
                          <tr>
                            <td className="label-col  text-start">Site</td>
                            <td className="colon text-start">:</td>
                            <td className="value-col text-start">
                              {bill.site}
                            </td>
                            <td rowSpan="4" className="payment-col">
                              {selectedBillData[bill.id] && (
                                <div className="payment-input-container">
                                  <select
                                    className="form-select shadow-none form-select-sm mb-2"
                                    value={
                                      selectedBillData[bill.id].paymentType ||
                                      "Full Payment"
                                    }
                                    onChange={(e) =>
                                      handlePaymentTypeChange(
                                        bill.id,
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="Full Payment">
                                      Full Payment
                                    </option>
                                    <option value="Partial Payment">
                                      Partial Payment
                                    </option>
                                  </select>

                                  {/* Payment Amount Input */}
                                  <input
                                    type="number"
                                    className={`form-control form-control-sm text-end fw-bold ${selectedBillData[bill.id].error ? "border-danger" : ""}`}
                                    value={selectedBillData[bill.id].paid ?? ""}
                                    onChange={(e) =>
                                      handleAmountChange(
                                        bill.id,
                                        e.target.value,
                                      )
                                    }
                                    disabled={
                                      selectedBillData[bill.id].paymentType ===
                                      "Full Payment"
                                    }
                                    placeholder="0.00"
                                    min="0"
                                  />

                                  {/* Error Message */}
                                  {selectedBillData[bill.id].error && (
                                    <div className="text-danger small mt-1">
                                      {selectedBillData[bill.id].error}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="label-col text-start">
                              Sup Bill No
                            </td>
                            <td className="colon text-start">:</td>
                            <td className="value-col text-start">{bill.id}</td>
                          </tr>
                          <tr>
                            <td className="label-col text-start">
                              Bill Amount
                            </td>
                            <td className="colon text-start">:</td>
                            <td className="value-col text-start">
                              {bill.billAmount}
                            </td>
                          </tr>
                          <tr>
                            <td className="label-col text-start">
                              Outstanding Amount
                            </td>
                            <td className="colon text-start">: </td>
                            <td className="value-col text-start">
                              {bill.outstanding}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>

                {/* Bottom Calculation Box */}
                <div className="mt-3 d-flex gap-3 p-3 total-bill-text   border-top  ">
                  <div className="d-flex flex-wrap gap-md-1 gap-0 fw-bold text-muted small mb-1">
                    <span>Sum of Bills :</span>{" "}
                    <span className="fw-bold">{sumOfBills}</span>
                  </div>
                  <div className="d-flex flex-wrap gap-md-1 gap-0 small mb-1 fw-bold text-muted">
                    <span>Sum of Outstanding:</span>{" "}
                    <span className="fw-bold">{sumOfOS}</span>
                  </div>
                  <div className="d-flex flex-wrap gap-md-1 gap-0 small  text-muted fw-bold">
                    <span>Settlement :</span> <span>{totalSettlement}</span>
                  </div>
                </div>
                {formErrors.bills && (
                  <div className="text-danger small p-3">
                    {formErrors.bills}
                  </div>
                )}
                {!selectedPayments && (
                  <div className=" ms-auto gap-1 small mt-3">
                    <button
                      className="btn btn-primary flex-fill fw-semibold py-2 shadow"
                      onClick={handleSave}
                    >
                      SAVE
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderList;
