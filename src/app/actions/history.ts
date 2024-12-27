import History from '@/models/History';
import { HistoryDTO } from '../types';

interface FilterOptions {
    name?: string;
    email?: string;
    salaryStatus?: string;
    dispatchDate?: { month: number; year: number } | undefined;
}

export async function fetchHistory(
    page: number,
    limit: number,
    filters: FilterOptions
): Promise<{ data: HistoryDTO[]; currentPage: number; limit: number; totalRecords: number }> {
    try {
        const query: any = {};

        if (filters.salaryStatus) {
            query.salaryStatus = filters.salaryStatus;
        }

        if (filters.dispatchDate) {
            const { month, year } = filters.dispatchDate;
            query.dispatchDate = {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1),
            };
        }

        const totalRecords = await History.countDocuments(query);
        const userMatch: any = {};
        if (filters.email) {
            userMatch.email = { $regex: filters.email, $options: 'i' };
        }
        if (filters.name) {
            userMatch.name = { $regex: filters.name, $options: 'i' };
        }
        const history = await History.find(query)
            .populate({
                path: "user",
                model: "User",
                match: userMatch
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean<HistoryDTO[]>();

        const filteredHistory = history.filter((item) => item.user !== null);

        const data = filteredHistory.map((his: any) => ({
            ...his,
            _id: his._id.toString(),
        }));

        return {
            data,
            currentPage: page,
            limit,
            totalRecords,
        };
    } catch (error) {
        console.error("Error fetching history:", error);
        return {
            data: [],
            currentPage: page,
            limit,
            totalRecords: 0,
        };
    }
}