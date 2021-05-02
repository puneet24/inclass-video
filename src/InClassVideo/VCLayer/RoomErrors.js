export default {
  NotFoundError: {
    cause: [
      "User has disabled the input device for the browser in the system settings",
      "User's machine does not have any such input device connected to it"
    ],
    solution: [
      "Ensure that the browser has access to input device in the system settings.",
      "You should have atleast one input device connected"
    ]
  },
  NotAllowedError: {
    cause: [
      "User has denied permission for your app to access the input device, either by clicking the “deny” button on the permission dialog, or by going to the browser settings",
      "User has denied permission for your app by dismissing the permission dialog"
    ],
    solution: [
      "Allow WhiteHatJr. to access the input device in the browser settings and then click on reload",
      "Reload the page and allow WhiteHatJr. to access the input device in the browser settings"
    ]
  },
  TypeError: {
    cause: ["Your app is being served from a non-localhost non-secure context"],
    solution: [
      "Your app should be served from a secure context (localhost or https)"
    ]
  },
  NotReadableError: {
    cause: [
      "The browser could not start media capture with the input device even after the user gave permission, probably because another app or tab has reserved the input device"
    ],
    solution: [
      "Please close all other apps and tabs that have reserved the input device permission and reload your app. Even if that does not solve your issue please restart you browser"
    ]
  },
  OverconstrainedError: {
    cause: [
      "The input device could not satisfy the requested media constraints"
    ],
    solution: [
      "If this exception was raised due to your app requesting a specific device ID, then most likely the input device is no longer connected to the machine, so your app should request the default input device"
    ]
  }
};
