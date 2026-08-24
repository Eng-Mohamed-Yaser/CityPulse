import Report from "../models/reports.model.js";
import { IssueGroup } from "../models/issueGroupe.model.js";

export interface DashboardSummary {
    totalReports: number;
    totalGroups: number;
    resolvedGroups: number;
    resolvedRate: number;
}

export interface ReportsByCategory {
    category: string;
    reportCount: number;
}

export interface GroupsByLocation {
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    groupCount: number;
}

class DashboardService {
    async getSummary(): Promise<DashboardSummary> {
        const [ totalReports, totalGroups, resolvedGroups, ] = await Promise.all([
            Report.countDocuments(),
            IssueGroup.countDocuments(),
            IssueGroup.countDocuments({ status: "Resolved",     }),
        ]);

        const resolvedRate =
            totalGroups === 0
                ? 0
                : Number(((resolvedGroups / totalGroups) * 100).toFixed(2));

        return {
            totalReports,
            totalGroups,
            resolvedGroups,
            resolvedRate,
        };
    }


    async getReportsByCategory(): Promise<ReportsByCategory[]> {
        const result = await Report.aggregate<ReportsByCategory>([
            {
                $group: {
                    _id: "$category",
                    reportCount: {
                        $sum: 1,
                    },
                },
            },

            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    reportCount: 1,
                },
            },

            {
                $sort: {
                    reportCount: -1,
                },
            },
        ]);

        return result;
    }

    async getGroupsByLocation(): Promise<GroupsByLocation[]> {
        const result = await IssueGroup.aggregate<GroupsByLocation>([
            {
                $match: {
                    "centerLocation.type": "Point",
                    "centerLocation.coordinates": {
                        $exists: true,
                        $type: "array",
                    },
                },
            },

            {
                $project: {
                    longitude: {
                        $arrayElemAt: ["$centerLocation.coordinates", 0],
                    },

                    latitude: {
                        $arrayElemAt: ["$centerLocation.coordinates", 1],
                    },
                },
            },

            {
                $project: {
                    longitude: {
                        $round: [
                            {
                                $multiply: ["$longitude", 1000],
                            },
                            0,
                        ],
                    },

                    latitude: {
                        $round: [
                            {
                                $multiply: ["$latitude", 1000],
                            },
                            0,
                        ],
                    },
                },
            },

            {
                $group: {
                    _id: {
                        longitude: "$longitude",
                        latitude: "$latitude",
                    },

                    groupCount: {
                        $sum: 1,
                    },
                },
            },

            {
                $project: {
                    _id: 0,

                    location: {
                        type: "Point",

                        coordinates: [
                            {
                                $divide: ["$_id.longitude", 1000],
                            },
                            {
                                $divide: ["$_id.latitude", 1000],
                            },
                        ],
                    },

                    groupCount: 1,
                },
            },

            {
                $sort: {
                    groupCount: -1,
                },
            },

            {
                $limit: 10,
            },
        ]);

        return result;
    }
}

export const dashboardService = new DashboardService();