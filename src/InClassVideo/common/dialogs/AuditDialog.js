import React from "react";
import moment from "moment-timezone";
import BaseDialog from "./BaseDialog";

export const AuditDialog = ({
  auditData,
  auditDialog,
  setAuditDialog,
  globalTz = moment.tz.guess()
}) => {
  return (
    <BaseDialog
      maxWidth="md"
      open={auditDialog.open}
      onClose={() => {
        setAuditDialog({ open: false });
      }}
    >
      <div className="heading3_b mb-5">Audit History</div>
      <div className="mb-5">
        {auditData.length ? (
          <div className="table-responsive">
            <table
              className="table-bordered text-left"
              style={{ tableLayout: "fixed", minWidth: "100%" }}
            >
              <thead>
                <tr>
                  <th className={"text-nowrap pr-2 pl-2 audit-width-30"}>
                    Action Date & Time
                  </th>
                  <th className="text-nowrap pr-2 pl-2 audit-width-40">
                    Action By
                  </th>
                  <th className="text-nowrap pr-2 pl-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {auditData.map(
                  (
                    {
                      data,
                      actionName,
                      tableName,
                      actionBy,
                      actionByEmail,
                      actionByMobile,
                      actionTime
                    },
                    i
                  ) => (
                    <tr key={i}>
                      <td className="text-nowrap pr-2 pl-2">
                        {actionTime
                          ? moment(actionTime)
                              .tz(globalTz)
                              .format("ll")
                          : ""}
                        <br />
                        {actionTime
                          ? moment(actionTime)
                              .tz(globalTz)
                              .format("h:mm:ss a")
                          : ""}
                      </td>
                      <td className="text-nowrap pr-2 pl-2">
                        {actionByEmail
                          ? actionByEmail
                          : actionByEmail === null || actionByEmail === ""
                          ? "system"
                          : ""}
                        <br />
                        {actionByMobile}
                      </td>
                      <td className="text-nowrap pr-2 pl-2">
                        {actionName}
                        <br />
                        {Object.keys(data).map(key => (
                          <div>{`${key} - ${data[key].value}`}</div>
                        ))}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center">No data available...</div>
        )}
      </div>
    </BaseDialog>
  );
};
