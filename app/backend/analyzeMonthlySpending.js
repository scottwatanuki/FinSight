import { db } from "../../firebase";
import { doc } from "firebase/firestore";
import { fetchOneCategorySH, fetchUserBudget } from "./fetchData";

let categories = ["bills", "shopping", "food", "health"];

function isWithinMonth(date) {
    //YYYY-MM-DD
    const transactionDate = new Date(date);
    const currentDate = new Date();

    return (
        transactionDate.getFullYear() === currentDate.getFullYear() &&
        transactionDate.getMonth() === currentDate.getMonth()
    );
}

export async function calcSpendingPerCategory(userID) {}
