const swaggerSpec = {
  "openapi": "3.0.3",
  "info": {
    "title": "Google Business Profile OAuth POC",
    "version": "1.0.0",
    "description": "API documentation for Google Business Profile OAuth 2.0 sample application."
  },
  "servers": [
    {
      "url": "http://localhost:3000",
      "description": "Local development server"
    }
  ],
  "tags": [
    {
      "name": "Auth",
      "description": "Authentication and token management"
    },
    {
      "name": "Locations",
      "description": "Manage business locations"
    },
    {
      "name": "Media",
      "description": "Manage location media and photos"
    },
    {
      "name": "Reviews",
      "description": "Manage and reply to reviews"
    },
    {
      "name": "Categories",
      "description": "Business categories"
    },
    {
      "name": "Utility",
      "description": "Health and documentation"
    },
    {
      "name": "Metrics",
      "description": "Business performance metrics and insights"
    },
    {
      "name": "Verifications",
      "description": "Check and request business location verification"
    },
    {
      "name": "Chains",
      "description": "Search and retrieve global corporate chains"
    },
    {
      "name": "Posts",
      "description": "Manage local posts for a location"
    }
  ],
  "paths": {
    "/": {
      "get": {
        "tags": [
          "Utility"
        ],
        "summary": "Home page",
        "description": "Returns the interactive login page.",
        "responses": {
          "200": {
            "description": "HTML login page",
            "content": {
              "text/html": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/health": {
      "get": {
        "tags": [
          "Utility"
        ],
        "summary": "Health check",
        "description": "Returns the server health status and uptime.",
        "responses": {
          "200": {
            "description": "Health status",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string"
                    },
                    "timestamp": {
                      "type": "string",
                      "format": "date-time"
                    },
                    "uptime": {
                      "type": "number"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/token-status": {
      "get": {
        "tags": [
          "Utility"
        ],
        "summary": "Token status",
        "description": "Returns the saved token state and refresh status.",
        "responses": {
          "200": {
            "description": "Token status details",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "tokenStatus": {
                      "type": "object",
                      "properties": {
                        "authenticated": {
                          "type": "boolean"
                        },
                        "accessToken": {
                          "type": "string"
                        },
                        "refreshToken": {
                          "type": "string"
                        },
                        "expiryDate": {
                          "type": "string",
                          "format": "date-time"
                        },
                        "secondsUntilExpiry": {
                          "type": "number"
                        },
                        "minutes": {
                          "type": "number"
                        },
                        "isExpired": {
                          "type": "boolean"
                        },
                        "isExpiringSoon": {
                          "type": "boolean"
                        },
                        "lastSaved": {
                          "type": "string",
                          "format": "date-time"
                        },
                        "message": {
                          "type": "string"
                        }
                      }
                    },
                    "refreshAction": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    
    "/quotas/business-information": {
      "get": {
        "tags": ["Utility"],
        "summary": "Get Quotas: business information",
        "description": "Returns Google Cloud Service Usage quotas for business information.",
        "parameters": [
          {
            "name": "projectId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "513681269462"
            },
            "description": "Google Cloud Project ID (or Number)",
            "example": "513681269462"
          }
        ],
        "responses": {
          "200": { "description": "Quotas list" }
        }
      }
    },
    "/quotas/account-management": {
      "get": {
        "tags": ["Utility"],
        "summary": "Get Quotas: account management",
        "description": "Returns Google Cloud Service Usage quotas for account management.",
        "parameters": [
          {
            "name": "projectId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "513681269462"
            },
            "description": "Google Cloud Project ID (or Number)",
            "example": "513681269462"
          }
        ],
        "responses": {
          "200": { "description": "Quotas list" }
        }
      }
    },
    "/quotas/verifications": {
      "get": {
        "tags": ["Utility"],
        "summary": "Get Quotas: verifications",
        "description": "Returns Google Cloud Service Usage quotas for verifications.",
        "parameters": [
          {
            "name": "projectId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "513681269462"
            },
            "description": "Google Cloud Project ID (or Number)",
            "example": "513681269462"
          }
        ],
        "responses": {
          "200": { "description": "Quotas list" }
        }
      }
    },
    "/quotas/qanda": {
      "get": {
        "tags": ["Utility"],
        "summary": "Get Quotas: qanda",
        "description": "Returns Google Cloud Service Usage quotas for qanda.",
        "parameters": [
          {
            "name": "projectId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "513681269462"
            },
            "description": "Google Cloud Project ID (or Number)",
            "example": "513681269462"
          }
        ],
        "responses": {
          "200": { "description": "Quotas list" }
        }
      }
    },
    "/quotas/lodging": {
      "get": {
        "tags": ["Utility"],
        "summary": "Get Quotas: lodging",
        "description": "Returns Google Cloud Service Usage quotas for lodging.",
        "parameters": [
          {
            "name": "projectId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "513681269462"
            },
            "description": "Google Cloud Project ID (or Number)",
            "example": "513681269462"
          }
        ],
        "responses": {
          "200": { "description": "Quotas list" }
        }
      }
    },
    "/quotas/place-actions": {
      "get": {
        "tags": ["Utility"],
        "summary": "Get Quotas: place actions",
        "description": "Returns Google Cloud Service Usage quotas for place actions.",
        "parameters": [
          {
            "name": "projectId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "513681269462"
            },
            "description": "Google Cloud Project ID (or Number)",
            "example": "513681269462"
          }
        ],
        "responses": {
          "200": { "description": "Quotas list" }
        }
      }
    },
    "/quotas/legacy": {
      "get": {
        "tags": ["Utility"],
        "summary": "Get Quotas: legacy",
        "description": "Returns Google Cloud Service Usage quotas for legacy.",
        "parameters": [
          {
            "name": "projectId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "513681269462"
            },
            "description": "Google Cloud Project ID (or Number)",
            "example": "513681269462"
          }
        ],
        "responses": {
          "200": { "description": "Quotas list" }
        }
      }
    },
    "/quotas": {
      "get": {
        "tags": [
          "Utility"
        ],
        "summary": "Get Quotas",
        "description": "Returns Google Cloud Service Usage quotas.",
        "parameters": [
          {
            "name": "projectId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "513681269462"
            },
            "description": "Google Cloud Project ID (or Number)",
            "example": "513681269462"
          },
          {
            "name": "service",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "default": "mybusinessbusinessinformation.googleapis.com"
            },
            "description": "Google API Service Name (e.g. mybusinessbusinessinformation.googleapis.com)",
            "example": "mybusinessbusinessinformation.googleapis.com"
          }
        ],
        "responses": {
          "200": {
            "description": "Quotas list"
          }
        }
      }
    },
    "/auth/config": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "Get OAuth configuration",
        "description": "Returns current OAuth credentials and default demo values.",
        "responses": {
          "200": {
            "description": "Current OAuth configuration"
          }
        }
      },
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Update OAuth credentials",
        "description": "Allows frontend user to bring their own Google Client ID, Client Secret, and Redirect URI.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["clientId", "clientSecret"],
                "properties": {
                  "clientId": { "type": "string" },
                  "clientSecret": { "type": "string" },
                  "redirectUri": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Configuration updated"
          }
        }
      }
    },
    "/auth/status": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "Check authentication status",
        "description": "Returns whether the user currently has active OAuth tokens.",
        "responses": {
          "200": {
            "description": "Auth status"
          }
        }
      }
    },
    "/auth/google": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "Start OAuth login",
        "description": "Redirects the user to Google OAuth consent screen.",
        "responses": {
          "302": {
            "description": "Redirect to Google login"
          }
        }
      }
    },
    "/auth/google/callback": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "OAuth callback",
        "description": "Handles Google OAuth callback and returns tokens.",
        "parameters": [
          {
            "name": "code",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "Authorization code returned by Google"
          },
          {
            "name": "error",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "Error returned by Google if authentication failed"
          }
        ],
        "responses": {
          "200": {
            "description": "Token response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "message": {
                      "type": "string"
                    },
                    "tokens": {
                      "type": "object",
                      "properties": {
                        "accessToken": {
                          "type": "string"
                        },
                        "refreshToken": {
                          "type": "string"
                        },
                        "expiryDate": {
                          "type": "string",
                          "format": "date-time"
                        },
                        "expiresIn": {
                          "type": "number"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/auth/logout": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "Logout",
        "description": "Clears saved tokens from storage.",
        "responses": {
          "200": {
            "description": "Logout confirmation",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "message": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/accounts": {
      "get": {
        "tags": [
          "Locations"
        ],
        "summary": "List accounts",
        "description": "Returns Google Business Profile accounts for the authenticated user.",
        "responses": {
          "200": {
            "description": "Business accounts list",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object"
                    },
                    "accountCount": {
                      "type": "number"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          },
          "403": {
            "description": "Permission denied or service disabled"
          }
        }
      }
    },
    "/locations": {
      "get": {
        "tags": [
          "Locations"
        ],
        "summary": "List locations",
        "description": "Returns locations for a business account. Optionally specify accountId.",
        "parameters": [
          {
            "name": "accountId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "The account ID to fetch locations for (e.g. 101402422991166582712), or full resource name accounts/{accountId}."
          }
        ],
        "responses": {
          "200": {
            "description": "Locations list",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "account": {
                      "type": "object"
                    },
                    "data": {
                      "type": "object"
                    },
                    "locationCount": {
                      "type": "number"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          },
          "404": {
            "description": "No accounts or locations found"
          }
        }
      },
      "post": {
        "tags": [
          "Locations"
        ],
        "summary": "Create a location",
        "description": "Creates a new location. Use validateOnly=true to test the payload without actually creating it.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string",
                    "description": "The account ID to create the location under (e.g. 101402422991166582712)."
                  },
                  "locationData": {
                    "type": "object",
                    "description": "The location data payload containing title, languageCode, storefrontAddress, etc.",
                    "example": {
                      "languageCode": "en",
                      "title": "MAA ANJANI PETROLEUM SERVICE",
                      "storeCode": "179280",
                      "phoneNumbers": {
                        "primaryPhone": "+919782835399"
                      },
                      "categories": {
                        "primaryCategory": {
                          "name": "categories/gcid:gas_station"
                        }
                      },
                      "storefrontAddress": {
                        "regionCode": "IN",
                        "postalCode": "307514",
                        "administrativeArea": "Rajasthan",
                        "locality": "Udaipur",
                        "addressLines": [
                          "BHARAT PETROLEUM DEALERS",
                          "V&PO BHATANA"
                        ]
                      },
                      "latlng": {
                        "latitude": 24.521721,
                        "longitude": 72.519443
                      },
                      "websiteUri": "https://www.bharatpetroleum.in",
                      "regularHours": {
                        "periods": [
                          {
                            "openDay": "MONDAY",
                            "openTime": {
                              "hours": 6,
                              "minutes": 0
                            },
                            "closeDay": "MONDAY",
                            "closeTime": {
                              "hours": 22,
                              "minutes": 0
                            }
                          },
                          {
                            "openDay": "TUESDAY",
                            "openTime": {
                              "hours": 6,
                              "minutes": 0
                            },
                            "closeDay": "TUESDAY",
                            "closeTime": {
                              "hours": 22,
                              "minutes": 0
                            }
                          },
                          {
                            "openDay": "WEDNESDAY",
                            "openTime": {
                              "hours": 6,
                              "minutes": 0
                            },
                            "closeDay": "WEDNESDAY",
                            "closeTime": {
                              "hours": 22,
                              "minutes": 0
                            }
                          },
                          {
                            "openDay": "THURSDAY",
                            "openTime": {
                              "hours": 6,
                              "minutes": 0
                            },
                            "closeDay": "THURSDAY",
                            "closeTime": {
                              "hours": 22,
                              "minutes": 0
                            }
                          },
                          {
                            "openDay": "FRIDAY",
                            "openTime": {
                              "hours": 6,
                              "minutes": 0
                            },
                            "closeDay": "FRIDAY",
                            "closeTime": {
                              "hours": 22,
                              "minutes": 0
                            }
                          },
                          {
                            "openDay": "SATURDAY",
                            "openTime": {
                              "hours": 6,
                              "minutes": 0
                            },
                            "closeDay": "SATURDAY",
                            "closeTime": {
                              "hours": 22,
                              "minutes": 0
                            }
                          },
                          {
                            "openDay": "SUNDAY",
                            "openTime": {
                              "hours": 6,
                              "minutes": 0
                            },
                            "closeDay": "SUNDAY",
                            "closeTime": {
                              "hours": 22,
                              "minutes": 0
                            }
                          }
                        ]
                      },
                      "profile": {
                        "description": "Bharat Petroleum retail outlet."
                      }
                    }
                  },
                  "validateOnly": {
                    "type": "boolean",
                    "description": "If true, validates the request without creating the location. Default is true for safety.",
                    "default": true
                  },
                  "requestId": {
                    "type": "string",
                    "description": "Optional unique ID to detect duplicated requests. Max 50 characters (e.g. a UUID)."
                  }
                },
                "required": [
                  "accountId",
                  "locationData"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Created location (or validation success)"
          },
          "400": {
            "description": "Validation error"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}": {
      "get": {
        "tags": [
          "Locations"
        ],
        "summary": "Get specific location",
        "description": "Returns a specific location by its ID or name.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          },
          {
            "name": "readMask",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "Optional readMask for the location fields (e.g. name,title,storeCode)."
          }
        ],
        "responses": {
          "200": {
            "description": "Location details",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          },
          "404": {
            "description": "Location not found"
          }
        }
      },
      "patch": {
        "tags": [
          "Locations"
        ],
        "summary": "Update a location",
        "description": "Updates an existing location by its ID.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "updateMask": {
                    "type": "string",
                    "description": "Comma-separated list of fields to update (e.g. title,phoneNumbers).",
                    "example": "title,phoneNumbers"
                  },
                  "locationData": {
                    "type": "object",
                    "description": "The location data payload containing the fields to update.",
                    "example": {
                      "title": "UPDATED: MAA ANJANI PETROLEUM SERVICE",
                      "phoneNumbers": {
                        "primaryPhone": "+919782835400"
                      }
                    }
                  }
                },
                "required": [
                  "updateMask",
                  "locationData"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Location updated successfully"
          },
          "400": {
            "description": "Validation error"
          },
          "401": {
            "description": "Authentication required"
          },
          "404": {
            "description": "Location not found"
          }
        }
      },
      "delete": {
        "tags": [
          "Locations"
        ],
        "summary": "Delete a location",
        "description": "Deletes an existing location by its ID.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "responses": {
          "200": {
            "description": "Location deleted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "message": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          },
          "403": {
            "description": "Insufficient permissions"
          },
          "404": {
            "description": "Location not found"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },
    "/locations/{locationId}/attributes": {
      "get": {
        "tags": [
          "Locations"
        ],
        "summary": "Get location attributes",
        "description": "Returns the attributes for a specific location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "responses": {
          "200": {
            "description": "Attributes details"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      },
      "patch": {
        "tags": [
          "Locations"
        ],
        "summary": "Update location attributes",
        "description": "Updates attributes for a specific location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          },
          {
            "name": "attributeMask",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Comma-separated list of attributes to update (e.g. attributes/has_restroom).",
            "example": "attributes/has_restroom,attributes/has_car_wash"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "description": "The attributes data payload.",
                "example": {
                  "name": "locations/1234567890/attributes",
                  "attributes": [
                    {
                      "name": "attributes/has_restroom",
                      "values": [
                        true
                      ]
                    },
                    {
                      "name": "attributes/has_car_wash",
                      "values": [
                        true
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Attributes updated successfully"
          },
          "400": {
            "description": "Validation error"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/attributes/auto": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Auto-update location attributes",
        "description": "Updates attributes for a specific location without manually passing an attributeMask.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": { "type": "string" },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "attributes": {
                    "type": "array",
                    "items": { "type": "object" },
                    "description": "Array of attributes objects to update (e.g. { name: 'attributes/is_owned_by_women', values: [true] })"
                  }
                },
                "required": ["attributes"],
                "example": {
                  "attributes": [
                    {
                        "name": "attributes/is_owned_by_women",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_onsite_services",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_assisted_listening_devices",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_hearing_loop",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_wheelchair_accessible_entrance",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_wheelchair_accessible_parking",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_wheelchair_accessible_restroom",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_wheelchair_accessible_seating",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_car_wash",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/offers_compressed_natural_gas",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/sells_gas_diesel",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/sells_gas_ethanol_free",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_full_service_gas",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/offers_liquefied_petroleum_gas",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_oil_change",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/offers_pollution_under_control_certification",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_car_vacuum",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_onsite_convenience_store",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_restroom_unisex",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_restroom",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/welcomes_lgbtq",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/requires_cash_only",
                        "values": [
                            false
                        ]
                    },
                    {
                        "name": "attributes/pay_credit_card",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/pay_credit_card_types_accepted",
                        "values": [
                            "american_express",
                            "china_union_pay",
                            "diners_club",
                            "discover",
                            "jcb",
                            "mastercard",
                            "visa"
                        ]
                    },
                    {
                        "name": "attributes/pay_debit_card",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/pay_mobile_tez",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/pay_mobile_nfc",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_parking_garage_free",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_parking_lot_free",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_parking_street_free",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_onsite_parking",
                        "values": [
                            true
                        ]
                    },
                    {
                        "name": "attributes/has_parking_garage_paid",
                        "values": [
                            false
                        ]
                    },
                    {
                        "name": "attributes/has_parking_lot_paid",
                        "values": [
                            false
                        ]
                    },
                    {
                        "name": "attributes/has_parking_street_paid",
                        "values": [
                            false
                        ]
                    },
                    {
                        "name": "attributes/url_facebook",
                        "values": [
                            "https://www.facebook.com/bplc"
                        ]
                    },
                    {
                        "name": "attributes/url_instagram",
                        "values": [
                            "https://www.instagram.com/bplc"
                        ]
                    },
                    {
                        "name": "attributes/url_linkedin",
                        "values": [
                            "https://www.linkedin.com/company/bplc"
                        ]
                    },
                    {
                        "name": "attributes/url_pinterest",
                        "values": [
                            "https://www.pinterest.com/bplc"
                        ]
                    },
                    {
                        "name": "attributes/url_text_messaging",
                        "values": [
                            "sms:+917000636149"
                        ]
                    },
                    {
                        "name": "attributes/url_whatsapp",
                        "values": [
                            "https://wa.me/917000636149"
                        ]
                    },
                    {
                        "name": "attributes/url_twitter",
                        "values": [
                            "https://x.com/bplc"
                        ]
                    },
                    {
                        "name": "attributes/url_youtube",
                        "values": [
                            "https://www.youtube.com/@msrajawat298"
                        ]
                    },
                    {
                        "name": "attributes/preferred_messaging_service",
                        "values": [
                            "whatsapp"
                        ]
                    }
                  ]
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Attributes updated successfully" },
          "400": { "description": "Validation error or missing attributes" },
          "401": { "description": "Authentication required" }
        }
      }
    },
    "/locations/{locationId}/service-items": {
      "get": {
        "tags": ["Locations"],
        "summary": "Get service items",
        "description": "Retrieves the service items for a specific location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": { "type": "string" },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "responses": {
          "200": { "description": "Service items returned successfully" },
          "401": { "description": "Authentication required" }
        }
      },
      "patch": {
        "tags": ["Locations"],
        "summary": "Update service items",
        "description": "Updates the service items for a specific location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": { "type": "string" },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "serviceItems": {
                    "type": "array",
                    "items": { "type": "object" },
                    "description": "Array of service item objects"
                  }
                },
                "required": ["serviceItems"],
                "example": {
                    "serviceItems": [
                        {
                            "structuredServiceItem": {
                                "serviceTypeId": "job_type_id:oil_change",
                                "description": "Quick engine oil replacement, filter changes, and basic fluid top-ups."
                            },
                            "price": {
                                "currencyCode": "INR",
                                "units": "1500"
                            }
                        },
                        {
                            "structuredServiceItem": {
                                "serviceTypeId": "job_type_id:car_wash",
                                "description": "Automated express exterior car wash and manual deep vacuuming services."
                            },
                            "price": {
                                "currencyCode": "INR",
                                "units": "350"
                            }
                        },
                        {
                            "freeFormServiceItem": {
                                "category": "gcid:gas_station",
                                "label": {
                                    "displayName": "Premium Petrol (Per Litre)"
                                }
                            },
                            "price": {
                                "currencyCode": "INR",
                                "units": "105",
                                "nanos": 500000000
                            }
                        },
                        {
                            "freeFormServiceItem": {
                                "category": "gcid:gas_station",
                                "label": {
                                    "displayName": "Tyre Puncture Repair"
                                }
                            },
                            "price": {
                                "currencyCode": "INR",
                                "units": "100"
                            }
                        },
                        {
                            "freeFormServiceItem": {
                                "category": "gcid:gas_station",
                                "label": {
                                    "displayName": "Nitrogen Air Filling (All Tyres)"
                                }
                            },
                            "price": {
                                "currencyCode": "INR",
                                "units": "50"
                            }
                        }
                    ]
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Service items updated successfully" },
          "400": { "description": "Missing service items" },
          "401": { "description": "Authentication required" }
        }
      }
    },
    "/locations/{locationId}/metadata": {
      "get": {
        "tags": ["Locations"],
        "summary": "Get location metadata",
        "description": "Retrieves the metadata associated with a location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": { "type": "string" },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "responses": {
          "200": { "description": "Metadata returned successfully" },
          "401": { "description": "Authentication required" }
        }
      }
    },
    "/locations/{locationId}/whatsapp-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set WhatsApp URL",
        "description": "Specifically sets the WhatsApp URL attribute for a location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": { "type": "string" },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "whatsappUrl": {
                    "type": "string",
                    "description": "The WhatsApp URL (e.g., https://wa.me/55555555)"
                  }
                },
                "required": ["whatsappUrl"]
              }
            }
          }
        },
        "responses": {
          "200": { "description": "WhatsApp URL updated successfully" },
          "400": { "description": "Missing whatsappUrl parameter" },
          "401": { "description": "Authentication required" }
        }
      }
    },
    "/locations/{locationId}/facebook-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set Facebook URL",
        "description": "Specifically sets the Facebook URL attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" }, "description": "The location ID or full name." }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": { "facebookUrl": { "type": "string" } },
                "required": ["facebookUrl"]
              }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" }, "400": { "description": "Missing parameter" }, "401": { "description": "Authentication required" } }
      }
    },
    "/locations/{locationId}/instagram-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set Instagram URL",
        "description": "Specifically sets the Instagram URL attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "properties": { "instagramUrl": { "type": "string" } }, "required": ["instagramUrl"] }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" } }
      }
    },
    "/locations/{locationId}/linkedin-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set LinkedIn URL",
        "description": "Specifically sets the LinkedIn URL attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "properties": { "linkedinUrl": { "type": "string" } }, "required": ["linkedinUrl"] }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" } }
      }
    },
    "/locations/{locationId}/pinterest-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set Pinterest URL",
        "description": "Specifically sets the Pinterest URL attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "properties": { "pinterestUrl": { "type": "string" } }, "required": ["pinterestUrl"] }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" } }
      }
    },
    "/locations/{locationId}/text-messaging-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set Text Messaging URL",
        "description": "Specifically sets the Text Messaging URL attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "properties": { "textMessagingUrl": { "type": "string" } }, "required": ["textMessagingUrl"] }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" } }
      }
    },
    "/locations/{locationId}/tiktok-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set TikTok URL",
        "description": "Specifically sets the TikTok URL attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "properties": { "tiktokUrl": { "type": "string" } }, "required": ["tiktokUrl"] }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" } }
      }
    },
    "/locations/{locationId}/twitter-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set Twitter URL",
        "description": "Specifically sets the Twitter URL attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "properties": { "twitterUrl": { "type": "string" } }, "required": ["twitterUrl"] }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" } }
      }
    },
    "/locations/{locationId}/youtube-url": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set YouTube URL",
        "description": "Specifically sets the YouTube URL attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "properties": { "youtubeUrl": { "type": "string" } }, "required": ["youtubeUrl"] }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" } }
      }
    },
    "/locations/{locationId}/preferred-messaging-service": {
      "patch": {
        "tags": ["Locations"],
        "summary": "Set Preferred Messaging Service",
        "description": "Specifically sets the Preferred Messaging Service attribute for a location.",
        "parameters": [
          { "name": "locationId", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "type": "object", "properties": { "preferredMessagingService": { "type": "string" } }, "required": ["preferredMessagingService"] }
            }
          }
        },
        "responses": { "200": { "description": "Updated successfully" } }
      }
    },
    "/locations/{locationId}/media": {
      "get": {
        "tags": [
          "Media"
        ],
        "summary": "List media for a location",
        "description": "Retrieves all media uploaded for a specific location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          },
          {
            "name": "accountId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The account ID associated with this location (e.g. accounts/1234567890)."
          }
        ],
        "responses": {
          "200": {
            "description": "List of media items",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          }
        }
      },
      "post": {
        "tags": [
          "Media"
        ],
        "summary": "Upload media to a location",
        "description": "Uploads media (e.g. logo, cover photo) to a specific location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string",
                    "description": "The account ID associated with this location (e.g. accounts/1234567890)."
                  },
                  "mediaData": {
                    "type": "object",
                    "description": "The media payload.",
                    "example": {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "LOGO"
                      },
                      "sourceUrl": "https://www.bharatpetroleum.in/images/BPCL_transparent_logo_new.png"
                    }
                  }
                },
                "required": [
                  "accountId",
                  "mediaData"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Media successfully uploaded",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/reviews": {
      "get": {
        "tags": [
          "Reviews"
        ],
        "summary": "List reviews",
        "description": "Returns reviews for a specific location. Optionally specify accountId and/or locationId.",
        "parameters": [
          {
            "name": "accountId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "The account ID to query (e.g. 101402422991166582712)."
          },
          {
            "name": "locationId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "The location ID or full location resource name (e.g. accounts/101402422991166582712/locations/1234567890)."
          }
        ],
        "responses": {
          "200": {
            "description": "Reviews list",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "account": {
                      "type": "object"
                    },
                    "location": {
                      "type": "object"
                    },
                    "data": {
                      "type": "object"
                    },
                    "reviewCount": {
                      "type": "number"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          },
          "404": {
            "description": "No accounts, locations, or reviews found"
          }
        }
      }
    },
    "/categories": {
      "get": {
        "tags": [
          "Categories"
        ],
        "summary": "List categories",
        "description": "Returns a list of business categories.",
        "parameters": [
          {
            "name": "languageCode",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "The BCP 47 code of language (e.g. en-US)."
          },
          {
            "name": "regionCode",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "The ISO 3166-1 alpha-2 country code (e.g. US)."
          },
          {
            "name": "view",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "CATEGORY_VIEW_UNSPECIFIED",
                "BASIC",
                "FULL"
              ]
            },
            "description": "Specifies which parts of the Category resource should be returned (e.g. BASIC or FULL). Do not put search terms here."
          },
          {
            "name": "pageToken",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "A token identifying a page of results to return."
          }
        ],
        "responses": {
          "200": {
            "description": "List of categories",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/categories/search": {
      "get": {
        "tags": [
          "Categories"
        ],
        "summary": "Search categories",
        "description": "Searches for business categories by term.",
        "parameters": [
          {
            "name": "searchTerm",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The term to search for (e.g. pizza, gas station)."
          },
          {
            "name": "languageCode",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "The BCP 47 code of language (e.g. en-US)."
          },
          {
            "name": "regionCode",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "The ISO 3166-1 alpha-2 country code (e.g. US)."
          },
          {
            "name": "view",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "CATEGORY_VIEW_UNSPECIFIED",
                "BASIC",
                "FULL"
              ]
            },
            "description": "Specifies which parts of the Category resource should be returned (e.g. BASIC or FULL). Do not put search terms here."
          },
          {
            "name": "pageToken",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "A token identifying a page of results to return."
          }
        ],
        "responses": {
          "200": {
            "description": "List of matching categories",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/media/bulk": {
      "post": {
        "tags": [
          "Media"
        ],
        "summary": "Upload multiple media items to a location",
        "description": "Uploads an array of media items in bulk to a specific location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string",
                    "description": "The account ID associated with this location (e.g. accounts/1234567890)."
                  },
                  "mediaItems": {
                    "type": "array",
                    "description": "Array of media payloads to upload.",
                    "items": {
                      "type": "object"
                    }
                  }
                },
                "required": [
                  "accountId",
                  "mediaItems"
                ],
                "example": {
                  "accountId": "102111251055725412876",
                  "mediaItems": [
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "COVER"
                      },
                      "sourceUrl": "https://www.bharatpetroleum.in/images/BPCL_transparent_logo_new.png"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "PROFILE"
                      },
                      "sourceUrl": "https://www.bharatpetroleum.in/images/BPCL_transparent_logo_new.png"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "EXTERIOR"
                      },
                      "sourceUrl": "https://metahoscomevhbblb01.blob.core.windows.net/public-media/arb/hyperLocalImages/101875/1782655861864-e0aab5fb-563f-455b-aba7-6ef75d9ef079_PHOTO-2026-06-28-10-46-44.jpg"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "INTERIOR"
                      },
                      "sourceUrl": "https://metahoscomevhbblb01.blob.core.windows.net/public-media/arb/hyperLocalImages/101875/1782655861865-32e8e441-2abc-40ec-b511-d9276933701e_PHOTO-2026-06-28-10-46-43.jpg"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "PRODUCT"
                      },
                      "sourceUrl": "https://metahoscomevhbblb01.blob.core.windows.net/public-media/arb/hyperLocalImages/101875/1782655861865-eef59d83-c22a-4968-af68-12a014434c05_PHOTO-2026-06-28-10-46-45.jpg"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "AT_WORK"
                      },
                      "sourceUrl": "https://metahoscomevhbblb01.blob.core.windows.net/public-media/arb/hyperLocalImages/101875/1782655861865-f77a6581-671a-4d09-a82b-67305dbc5078_PHOTO-2026-06-28-10-46-46.jpg"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "TEAMS"
                      },
                      "sourceUrl": "https://omniprodcdn-e7f0fsd8bmgpf4dt.a03.azurefd.net/omni-webui/media/1781028756247.png"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "ADDITIONAL"
                      },
                      "sourceUrl": "https://omniprodcdn-e7f0fsd8bmgpf4dt.a03.azurefd.net/omni-webui/media/1781021672710.png"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "FOOD_AND_DRINK"
                      },
                      "sourceUrl": "https://www.bharatpetroleum.in/images/BPCL_transparent_logo_new.png"
                    },
                    {
                      "mediaFormat": "PHOTO",
                      "locationAssociation": {
                        "category": "MENU"
                      },
                      "sourceUrl": "https://www.bharatpetroleum.in/images/BPCL_transparent_logo_new.png"
                    }
                  ]
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Media items successfully processed",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/reviews/{reviewId}/reply": {
      "put": {
        "tags": [
          "Reviews"
        ],
        "summary": "Reply to a review",
        "description": "Replies to a specific review.",
        "parameters": [
          {
            "name": "reviewId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The review ID."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string",
                    "description": "The account ID (e.g. accounts/1234567890)."
                  },
                  "locationId": {
                    "type": "string",
                    "description": "The location ID (e.g. locations/1234567890)."
                  },
                  "reply": {
                    "type": "object",
                    "properties": {
                      "comment": {
                        "type": "string",
                        "description": "The content of the reply."
                      }
                    },
                    "required": [
                      "comment"
                    ]
                  }
                },
                "required": [
                  "accountId",
                  "locationId",
                  "reply"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Reply successfully posted",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/locations/{locationId}/performance-metrics": {
      "get": {
        "tags": [
          "Metrics"
        ],
        "summary": "Get multi-daily performance metrics",
        "description": "Retrieves multi-daily performance metrics for a location using the Business Profile Performance API (locations.fetchMultiDailyMetricsTimeSeries).",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          },
          {
            "name": "dailyMetrics",
            "in": "query",
            "required": true,
            "schema": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "WEBSITE_CLICKS",
                  "CALL_CLICKS",
                  "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
                  "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
                  "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
                  "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
                  "BUSINESS_CONVERSATIONS",
                  "BUSINESS_DIRECTION_REQUESTS",
                  "BUSINESS_BOOKINGS",
                  "BUSINESS_FOOD_ORDERS",
                  "BUSINESS_FOOD_MENU_CLICKS"
                ]
              }
            },
            "style": "form",
            "explode": true,
            "description": "The metrics to retrieve (can specify multiple times in query parameters)."
          },
          {
            "name": "startYear",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Start date year (e.g., 2024)"
          },
          {
            "name": "startMonth",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Start date month (1-12)"
          },
          {
            "name": "startDay",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Start date day (1-31)"
          },
          {
            "name": "endYear",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "End date year (e.g., 2024)"
          },
          {
            "name": "endMonth",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "End date month (1-12)"
          },
          {
            "name": "endDay",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "End date day (1-31)"
          }
        ],
        "responses": {
          "200": {
            "description": "Metrics report",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/daily-metrics-time-series": {
      "get": {
        "tags": [
          "Metrics"
        ],
        "summary": "Get daily metrics time series",
        "description": "Retrieves daily time-series metrics for a single metric over a specified date range using the Business Profile Performance API (locations.getDailyMetricsTimeSeries).",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          },
          {
            "name": "dailyMetric",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "enum": [
                "WEBSITE_CLICKS",
                "CALL_CLICKS",
                "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
                "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
                "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
                "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
                "BUSINESS_CONVERSATIONS",
                "BUSINESS_DIRECTION_REQUESTS",
                "BUSINESS_BOOKINGS",
                "BUSINESS_FOOD_ORDERS",
                "BUSINESS_FOOD_MENU_CLICKS"
              ]
            },
            "description": "The specific metric to retrieve."
          },
          {
            "name": "startYear",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Start date year (e.g., 2024)"
          },
          {
            "name": "startMonth",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Start date month (1-12)"
          },
          {
            "name": "startDay",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 1
            },
            "description": "Start date day (1-31, default: 1)"
          },
          {
            "name": "endYear",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "End date year (e.g., 2024)"
          },
          {
            "name": "endMonth",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "End date month (1-12)"
          },
          {
            "name": "endDay",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 1
            },
            "description": "End date day (1-31, default: 1)"
          }
        ],
        "responses": {
          "200": {
            "description": "Daily metrics time series response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "timeSeries": {
                          "type": "object",
                          "properties": {
                            "datedValues": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "date": {
                                    "type": "object",
                                    "properties": {
                                      "year": { "type": "integer" },
                                      "month": { "type": "integer" },
                                      "day": { "type": "integer" }
                                    }
                                  },
                                  "value": { "type": "string" }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/searchkeywords/impressions/monthly": {
      "get": {
        "tags": [
          "Metrics"
        ],
        "summary": "Get monthly search keywords impressions",
        "description": "Retrieves search keywords used to find the business profile with monthly impression counts or threshold privacy flags (locations.searchkeywords.impressions.monthly.list).",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890) or full location name."
          },
          {
            "name": "startYear",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Start month year (e.g., 2024)"
          },
          {
            "name": "startMonth",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Start month (1-12)"
          },
          {
            "name": "endYear",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "End month year (e.g., 2024)"
          },
          {
            "name": "endMonth",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "End month (1-12)"
          },
          {
            "name": "pageSize",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            },
            "description": "Number of results requested per page."
          },
          {
            "name": "pageToken",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "Token for pagination."
          }
        ],
        "responses": {
          "200": {
            "description": "Monthly search keywords impressions response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "searchKeywordsCounts": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "searchKeyword": { "type": "string" },
                              "insightsValue": {
                                "type": "object",
                                "properties": {
                                  "value": { "type": "string" },
                                  "threshold": { "type": "string" }
                                }
                              }
                            }
                          }
                        },
                        "nextPageToken": { "type": "string" }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/media/{mediaId}": {
      "patch": {
        "tags": [
          "Media"
        ],
        "summary": "Update media item",
        "description": "Updates metadata of a specific media item. Note: You can only update the category (except to COVER or PROFILE).",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890)"
          },
          {
            "name": "mediaId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The specific media ID to update"
          },
          {
            "name": "updateMask",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "The specific fields to update (e.g. locationAssociation.category)."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string",
                    "description": "The account ID associated with this location."
                  },
                  "mediaData": {
                    "type": "object",
                    "description": "The media metadata payload."
                  }
                },
                "required": [
                  "accountId",
                  "mediaData"
                ],
                "example": {
                  "accountId": "102111251055725412876",
                  "mediaData": {
                    "locationAssociation": {
                      "category": "EXTERIOR"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Media successfully updated"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/verifications": {
      "get": {
        "tags": [
          "Verifications"
        ],
        "summary": "List verifications",
        "description": "Check if the location is verified by listing its current verifications.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890)"
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/fetchVerificationOptions": {
      "post": {
        "tags": [
          "Verifications"
        ],
        "summary": "Fetch verification options",
        "description": "Get the available options to verify this location (e.g., SMS, Email, Postcard).",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890)"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "languageCode": {
                    "type": "string",
                    "description": "The BCP 47 language code representing the language to be used."
                  },
                  "context": {
                    "type": "object",
                    "description": "Optional. Extra context information for service businesses.",
                    "properties": {
                      "address": {
                        "type": "object",
                        "description": "The postal address for the service business context.",
                        "properties": {
                          "regionCode": {
                            "type": "string",
                            "description": "CLDR region code (e.g. IN)"
                          },
                          "postalCode": {
                            "type": "string"
                          },
                          "administrativeArea": {
                            "type": "string"
                          },
                          "locality": {
                            "type": "string"
                          },
                          "addressLines": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "required": [
                  "languageCode"
                ],
                "example": {
                  "languageCode": "en-US",
                  "context": {
                    "address": {
                      "regionCode": "IN",
                      "postalCode": "307514",
                      "administrativeArea": "Rajasthan",
                      "locality": "Udaipur",
                      "addressLines": [
                        "BHARAT PETROLEUM DEALERS",
                        "V&PO BHATANA"
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/verify": {
      "post": {
        "tags": [
          "Verifications"
        ],
        "summary": "Request verification",
        "description": "Initiate a verification process using one of the available options.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The location ID (e.g. 1234567890)"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "method": {
                    "type": "string",
                    "enum": [
                      "SMS",
                      "EMAIL",
                      "PHONE_CALL",
                      "POSTCARD",
                      "VIDEO_CALL",
                      "AUTO"
                    ],
                    "description": "The verification method to use."
                  },
                  "phoneNumber": {
                    "type": "string",
                    "description": "Required if method is SMS or PHONE_CALL."
                  },
                  "emailAddress": {
                    "type": "string",
                    "description": "Required if method is EMAIL."
                  },
                  "languageCode": {
                    "type": "string",
                    "description": "The language code (e.g. en-US)."
                  }
                },
                "required": [
                  "method",
                  "languageCode"
                ],
                "example": {
                  "method": "SMS",
                  "phoneNumber": "1234567890",
                  "languageCode": "en-US"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/verifications/{verificationId}/complete": {
      "post": {
        "tags": [
          "Verifications"
        ],
        "summary": "Complete verification",
        "description": "Complete the verification process by providing the PIN code.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "verificationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "example": {
                  "pin": "123456"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/chains": {
      "get": {
        "tags": [
          "Chains"
        ],
        "summary": "Search chains",
        "description": "Searches the Google Business Profile API for official chain entities (e.g. Starbucks, McDonald's).",
        "parameters": [
          {
            "name": "query",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The search query (e.g. Starbucks)"
          },
          {
            "name": "pageSize",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            },
            "description": "Number of results to return (default 10)"
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/chains/{chainId}": {
      "get": {
        "tags": [
          "Chains"
        ],
        "summary": "Get chain by ID",
        "description": "Retrieves a specific chain by its official Google ID.",
        "parameters": [
          {
            "name": "chainId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The chain ID (e.g. 1234567890)"
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          },
          "401": {
            "description": "Authentication required"
          }
        }
      }
    },
    "/locations/{locationId}/posts": {
      "get": {
        "tags": [
          "Posts"
        ],
        "summary": "List posts",
        "description": "Lists all local posts for a location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "accountId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "The account ID associated with this location"
          },
          {
            "name": "pageToken",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Posts"
        ],
        "summary": "Create post",
        "description": "Creates a new local post for a location.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string"
                  },
                  "postData": {
                    "type": "object"
                  }
                },
                "example": {
                  "accountId": "102111251055725412876",
                  "postData": {
                    "topicType": "STANDARD",
                    "languageCode": "en-US",
                    "summary": "Special offer today!",
                    "callToAction": {
                      "actionType": "LEARN_MORE",
                      "url": "https://example.com"
                    },
                    "media": [
                      {
                        "mediaFormat": "PHOTO",
                        "sourceUrl": "https://images.unsplash.com/photo-1572916843472-35db6c24f603?q=80&w=600"
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/locations/{locationId}/posts/{postId}": {
      "get": {
        "tags": [
          "Posts"
        ],
        "summary": "Get post",
        "description": "Gets a specific local post.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "postId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "accountId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "patch": {
        "tags": [
          "Posts"
        ],
        "summary": "Update post",
        "description": "Updates a specific local post.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "postId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string"
                  },
                  "updateMask": {
                    "type": "string"
                  },
                  "postData": {
                    "type": "object"
                  }
                },
                "example": {
                  "accountId": "102111251055725412876",
                  "updateMask": "summary",
                  "postData": {
                    "summary": "Updated special offer!"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "Posts"
        ],
        "summary": "Delete post",
        "description": "Deletes a specific local post.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "postId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string"
                  }
                },
                "example": {
                  "accountId": "102111251055725412876"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/locations/{locationId}/posts/bulk": {
      "post": {
        "tags": [
          "Posts"
        ],
        "summary": "Bulk create posts",
        "description": "Creates multiple local posts in a single request. Shows examples of different topic types and action types.",
        "parameters": [
          {
            "name": "locationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "accountId": {
                    "type": "string"
                  },
                  "posts": {
                    "type": "array",
                    "items": {
                      "type": "object"
                    }
                  }
                },
                "example": {
                  "accountId": "102111251055725412876",
                  "posts": [
                    {
                      "topicType": "STANDARD",
                      "languageCode": "en-US",
                      "summary": "Need to contact us immediately? Call us on our support line!",
                      "callToAction": {
                        "actionType": "CALL"
                      }
                    },
                    {
                      "topicType": "OFFER",
                      "languageCode": "en-US",
                      "summary": "Special weekend sale! 20% off all services.",
                      "event": {
                        "title": "Weekend Sale 20% Off",
                        "schedule": {
                          "startDate": { "year": 2026, "month": 8, "day": 15 },
                          "startTime": { "hours": 9, "minutes": 0, "seconds": 0, "nanos": 0 },
                          "endDate": { "year": 2026, "month": 8, "day": 16 },
                          "endTime": { "hours": 18, "minutes": 0, "seconds": 0, "nanos": 0 }
                        }
                      },
                      "offer": {
                        "couponCode": "WEEKEND20",
                        "redeemOnlineUrl": "https://www.bharatpetroleum.in/index",
                        "termsConditions": "Valid only on weekends."
                      },
                      "callToAction": {
                        "actionType": "SHOP",
                        "url": "https://www.bharatpetroleum.in/index"
                      },
                      "media": [
                        {
                          "mediaFormat": "PHOTO",
                          "sourceUrl": "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?q=80&w=600"
                        }
                      ]
                    },
                    {
                      "topicType": "EVENT",
                      "languageCode": "en-US",
                      "summary": "Join us for our Grand Re-opening Event!",
                      "event": {
                        "title": "Grand Re-opening",
                        "schedule": {
                          "startDate": {
                            "year": 2026,
                            "month": 8,
                            "day": 15
                          },
                          "startTime": {
                            "hours": 9,
                            "minutes": 0,
                            "seconds": 0,
                            "nanos": 0
                          },
                          "endDate": {
                            "year": 2026,
                            "month": 8,
                            "day": 15
                          },
                          "endTime": {
                            "hours": 18,
                            "minutes": 0,
                            "seconds": 0,
                            "nanos": 0
                          }
                        }
                      },
                      "callToAction": {
                        "actionType": "LEARN_MORE",
                        "url": "https://wa.me/917000646464"
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
