import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Products, ProductSearch, OrderSearch, AccountSearch } from "/lib/collections";
import {
  getSearchParameters,
  buildAccountSearchRecord,
  buildOrderSearchRecord,
  buildProductSearchRecord
} from "../methods/searchcollections";

Hooks.Events.add("afterAccountsInsert", (userId, accountId) => {
  if (AccountSearch && !Meteor.isAppTest) {
    // Passing forceIndex will run account search index even if
    // updated fields don't match a searchable field
    buildAccountSearchRecord(accountId, ["forceIndex"]);
  }
});

Hooks.Events.add("afterAccountsRemove", (userId, accountId) => {
  if (AccountSearch && !Meteor.isAppTest) {
    AccountSearch.remove(accountId);
  }
});

Hooks.Events.add("afterAccountsUpdate", (userId, updateData) => {
  const { accountId, updatedFields } = updateData;

  if (AccountSearch && !Meteor.isAppTest) {
    buildAccountSearchRecord(accountId, updatedFields);
  }
});


// NOTE: this hooks does not seemed to get fired, are there is no way
// to delete an order, only cancel.
// TODO: Verify the assumption above.
// Orders.after.remove((userId, doc) => {
//   if (OrderSearch && !Meteor.isAppTest) {
//     OrderSearch.remove(doc._id);
//   }
// });

Hooks.Events.add("afterOrderInsert", (doc) => {
  if (OrderSearch && !Meteor.isAppTest) {
    const orderId = doc._id;
    buildOrderSearchRecord(orderId);
  }

  return doc;
});

Hooks.Events.add("afterUpdateOrderUpdateSearchRecord", (order) => {
  if (OrderSearch && !Meteor.isAppTest) {
    const orderId = order._id;
    OrderSearch.remove(orderId);
    buildOrderSearchRecord(orderId);
  }
});

/**
 * if product is removed, remove product search record
 * @private
 */
Hooks.Events.add("afterRemoveProduct", (doc) => {
  if (ProductSearch && !Meteor.isAppTest && doc.type === "simple") {
    const productId = doc._id;
    ProductSearch.remove(productId);
    Logger.debug(`Removed product ${productId} from ProductSearch collection`);
  }

  return doc;
});

/**
 * after insert
 * @summary should fires on create new variants, on clones products/variants
 * @private
 */
Hooks.Events.add("afterInsertProduct", (doc) => {
  if (ProductSearch && !Meteor.isAppTest && doc.type === "simple") {
    const productId = doc._id;
    buildProductSearchRecord(productId);
    Logger.debug(`Added product ${productId} to ProductSearch`);
  }

  return doc;
});
