import React, { useState, useEffect } from "react";
import OrderList from "./Orderlist";
import "./LandingPage.css";

function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [payments, setPayments] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState(null);

  useEffect(() => {
    const savedRecords =
      JSON.parse(localStorage.getItem("payment_records")) || [];
    setPayments(savedRecords);
  }, []);

  const grandTotal = payments.reduce(
    (sum, p) => sum + (p.totalSettlement || 0),
    0,
  );
  const openingBlance = 33079;

  let runningBalance = -openingBlance; 

  const rowsWithBalance = payments.map((p) => {
    runningBalance -= p.totalSettlement || 0;

    return {
      ...p,
      osBalance: runningBalance,
    };
  });

  console.log(rowsWithBalance);

  const osBalanceTotal =
    rowsWithBalance.length > 0
      ? rowsWithBalance[rowsWithBalance.length - 1].osBalance
      : -openingBlance;
  return (
    <>
      <div className="main-container position-relative container-fluid  p-3">
        <div className="d-flex heading-container align-items-center justify-content-between mt-3 mb-4">
          <h2 className="fw-bold fs-6 ">DAY BOOK</h2>
          <div className="d-flex ">
            <button
              className="btn btn-dark btn-sm rounded-pill "
              onClick={() => setShowModal(true)}
            >
              + Add Payment
            </button>
          </div>
        </div>
        {showModal && (
          <div className="payment-form" onClick={() => setShowModal(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <OrderList
                selectedPayments={selectedPayments}
                onSave={() => {
                  const updatedRecords =
                    JSON.parse(localStorage.getItem("payment_records")) || [];
                  setPayments(updatedRecords);
                  setShowModal(false);
                  setSelectedPayments(null);
                }}
                onClose={() => {
                  setShowModal(false);
                  setSelectedPayments(null);
                }}
              />
            </div>
          </div>
        )}

        <div className="table-container">
          <table className="table table-bordered shadow-sm">
            <thead className=" ">
              <tr>
                <th>S.No</th>
                <th>Admin</th>
                <th>Auditor</th>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Vendor</th>
                <th>Payments (To)</th>
                <th>O/S Balance</th>
                <th>Source</th>
                <th>Mode</th>
                <th>Type</th>
                <th>Cost Type</th>
                <th>Project</th>
              </tr>
            </thead>
            <tbody>
              {rowsWithBalance.length > 0 && (
                <tr className="opening-row table-danger">
                  <td colSpan="6"></td>
                  <td className="fw-bold">Opening</td>
                  <td className="fw-bold"> -33,079.00</td>
                  <td colSpan="5"></td>
                </tr>
              )}
              {rowsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-4">
                    No results found.
                  </td>
                </tr>
              ) : (
                rowsWithBalance.map((p, idx) => (
                  <tr
                    key={p.id}
                    onClick={() => {
                      setSelectedPayments(p);
                      setShowModal(true);
                    }}
                  >
                    <td>{idx + 1}</td>
                    <td>
                      <span className="status-dot"></span>
                    </td>
                    <td>
                      <span className="status-dot"></span>
                    </td>
                    <td>{2800 + idx}</td>
                    <td>{p.formDate}</td>
                    <td className=" fw-bold text-black">{p.vendor}</td>
                    <td className="">
                      {p.totalSettlement?.toLocaleString() || 0}
                    </td>
                    <td>{p.osBalance.toLocaleString()}</td>
                    <td>{p.source}</td>
                    <td>{p.adjustingType}</td>
                    <td>{p.formType}</td>
                    <td>{p.costType}</td>
                    <td>{p.project}</td>
                  </tr>
                ))
              )}
            </tbody>
            {payments.length > 0 && (
              <tfoot className="table-footer table-info">
                <tr>
                  <td colSpan="5" className="">
                  </td>
                  <td colSpan="" className="text-center ">
                    Total
                  </td>
                  <td className="text-center  fw-bold">
                    {grandTotal.toLocaleString()}
                  </td>
                  <td className="text-center os-data  fw-bold">
                    {osBalanceTotal.toLocaleString()}
                  </td>
                  <td colSpan="6"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
