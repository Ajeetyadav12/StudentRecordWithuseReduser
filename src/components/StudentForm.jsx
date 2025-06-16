import React, { useEffect, useReducer } from "react";

// Initial state
const initialState = {
  name: "",
  age: "",
  marks: ["", "", "", "", ""],
  students: [],
  editIndex: null,
  errors: "",
  preview: null,
  filterName: "",
  filterDivision: "All",
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_MARK":
      const updatedMarks = [...state.marks];
      updatedMarks[action.index] = action.value;
      return { ...state, marks: updatedMarks };
    case "SET_PREVIEW":
      return { ...state, preview: action.value };
    case "SET_ERROR":
      return { ...state, errors: action.value };
    case "ADD_STUDENT":
      return {
        ...state,
        students: [...state.students, action.student],
        name: "",
        age: "",
        marks: ["", "", "", "", ""],
        preview: null,
        editIndex: null,
        errors: "",
      };
    case "UPDATE_STUDENT":
      const updatedStudents = [...state.students];
      updatedStudents[state.editIndex] = action.student;
      return {
        ...state,
        students: updatedStudents,
        name: "",
        age: "",
        marks: ["", "", "", "", ""],
        preview: null,
        editIndex: null,
        errors: "",
      };
    case "EDIT_STUDENT":
      return {
        ...state,
        name: action.student.name,
        age: action.student.age,
        marks: action.student.marks.map(String),
        editIndex: action.index,
        errors: "",
      };
    case "DELETE_STUDENT":
      return {
        ...state,
        students: state.students.filter((_, i) => i !== action.index),
      };
    case "CLEAR_FORM":
      return {
        ...state,
        name: "",
        age: "",
        marks: ["", "", "", "", ""],
        editIndex: null,
        errors: "",
        preview: null,
      };
    default:
      return state;
  }
}

// Result calculation function
const calculateResult = (marksArray) => {
  const total = marksArray.reduce((a, b) => a + b, 0);
  const percentage = (total / 500) * 100;
  let division = "Fail";
  if (percentage >= 60) division = "First Division";
  else if (percentage >= 45) division = "Second Division";
  else if (percentage >= 33) division = "Third Division";
  return {
    percentage: percentage.toFixed(2),
    division,
  };
};

const StudentForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Update preview on marks change
  useEffect(() => {
    const numMarks = state.marks.map(Number);
    if (numMarks.every((m) => !isNaN(m) && m >= 0 && m <= 100)) {
      dispatch({ type: "SET_PREVIEW", value: calculateResult(numMarks) });
    } else {
      dispatch({ type: "SET_PREVIEW", value: null });
    }
  }, [state.marks]);

  const handleSubmit = () => {
    dispatch({ type: "SET_ERROR", value: "" });

    if (!/^[A-Za-z ]+$/.test(state.name.trim())) {
      dispatch({
        type: "SET_ERROR",
        value: "Name should only contain letters and spaces.",
      });
      return;
    }

    const numAge = Number(state.age);
    if (!Number.isInteger(numAge) || numAge <= 0 || numAge > 100) {
      dispatch({
        type: "SET_ERROR",
        value: "Age should be a positive integer between 1 and 100.",
      });
      return;
    }

    const numMarks = state.marks.map(Number);
    if (numMarks.some((m) => isNaN(m) || m < 0 || m > 100)) {
      dispatch({
        type: "SET_ERROR",
        value: "All marks must be between 0 and 100.",
      });
      return;
    }

    const result = calculateResult(numMarks);
    const student = {
      name: state.name.trim(),
      age: numAge,
      marks: numMarks,
      percentage: result.percentage,
      division: result.division,
    };

    if (state.editIndex !== null) {
      dispatch({ type: "UPDATE_STUDENT", student });
    } else {
      dispatch({ type: "ADD_STUDENT", student });
    }
  };

  const filteredStudents = state.students.filter((s) => {
    const nameMatch = s.name
      .toLowerCase()
      .includes(state.filterName.toLowerCase());
    const divisionMatch =
      state.filterDivision === "All" || s.division === state.filterDivision;
    return nameMatch && divisionMatch;
  });

  return (
    <div className="container mt-5 d-flex flex-column flex-md-row gap-4">
      <div className="card shadow p-4" style={{ width: "370px" }}>
        <h4 className="text-center text-primary fw-bold">🎓 Student Record</h4>
        {state.errors && (
          <div className="alert alert-danger py-2">{state.errors}</div>
        )}

        <label className="form-label">Student Name</label>
        <input
          className="form-control mb-2"
          value={state.name}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "name",
              value: e.target.value,
            })
          }
        />

        <label className="form-label">Age</label>
        <input
          className="form-control mb-2"
          type="number"
          value={state.age}
          onChange={(e) =>
            dispatch({ type: "SET_FIELD", field: "age", value: e.target.value })
          }
        />

        {state.marks.map((mark, i) => (
          <div key={i}>
            <label className="form-label">Marks {i + 1}</label>
            <input
              className="form-control mb-2"
              type="number"
              value={mark}
              onChange={(e) =>
                dispatch({
                  type: "SET_MARK",
                  index: i,
                  value: e.target.value,
                })
              }
            />
          </div>
        ))}

        {state.preview && (
          <div className="alert alert-info py-2 text-center">
            <strong>Preview:</strong>
            <br />
            Percentage: <strong>{state.preview.percentage}%</strong> <br />
            Division:{" "}
            <span
              className={`badge ${
                state.preview.division === "First Division"
                  ? "bg-success"
                  : state.preview.division === "Second Division"
                  ? "bg-primary"
                  : state.preview.division === "Third Division"
                  ? "bg-warning text-dark"
                  : "bg-danger"
              }`}
            >
              {state.preview.division}
            </span>
          </div>
        )}

        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-success w-50 me-2" onClick={handleSubmit}>
            {state.editIndex !== null ? "Update" : "Submit"}
          </button>
          <button
            className="btn btn-outline-secondary w-50"
            onClick={() => dispatch({ type: "CLEAR_FORM" })}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Records Section */}
      <div
        className="bg-dark text-white p-3 rounded shadow overflow-auto"
        style={{ width: "100%", height: "520px" }}
      >
        <h5 className="text-center mb-3">📋 Student Records</h5>

        <div className="mb-3 d-flex flex-column flex-md-row gap-3 justify-content-center">
          <input
            type="text"
            className="form-control w-100 w-md-50"
            placeholder="Search by Name"
            value={state.filterName}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "filterName",
                value: e.target.value,
              })
            }
          />
          <select
            className="form-select w-100 w-md-25"
            value={state.filterDivision}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "filterDivision",
                value: e.target.value,
              })
            }
          >
            <option value="All">All Divisions</option>
            <option value="First Division">First Division</option>
            <option value="Second Division">Second Division</option>
            <option value="Third Division">Third Division</option>
            <option value="Fail">Fail</option>
          </select>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-center mt-5">No matching records found.</p>
        ) : (
          <table className="table table-bordered table-sm table-dark text-center align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                {[...Array(5)].map((_, i) => (
                  <th key={i}>M{i + 1}</th>
                ))}
                <th>%</th>
                <th>Division</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.name}</td>
                  <td>{s.age}</td>
                  {s.marks.map((m, i) => (
                    <td key={i}>{m}</td>
                  ))}
                  <td>{s.percentage}</td>
                  <td>
                    <span
                      className={`badge ${
                        s.division === "First Division"
                          ? "bg-success"
                          : s.division === "Second Division"
                          ? "bg-primary"
                          : s.division === "Third Division"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {s.division}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-light"
                      onClick={() =>
                        dispatch({
                          type: "EDIT_STUDENT",
                          index: idx,
                          student: s,
                        })
                      }
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        dispatch({ type: "DELETE_STUDENT", index: idx })
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentForm;
