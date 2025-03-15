import { Cardinality as Cardinality$1, TypeKind, ExpressionKind, util, OperatorKind as OperatorKind$1, reservedKeywords, StrictMap } from "gel/dist/reflection/index.js";
import * as gel from "gel";
import { LocalDate, LocalDateTime, LocalTime, Duration, RelativeDuration, DateDuration, Range as Range$1, InputDataError, ConfigMemory } from "gel";
import { encodeB64 } from "gel/dist/primitives/buffer.js";
var cardutil;
((cardutil2) => {
  function multiplyCardinalities(c1, c2) {
    if (c1 === Cardinality$1.Empty) return Cardinality$1.Empty;
    if (c1 === Cardinality$1.One) return c2;
    if (c1 === Cardinality$1.AtMostOne) {
      if (c2 === Cardinality$1.One) return Cardinality$1.AtMostOne;
      if (c2 === Cardinality$1.AtLeastOne) return Cardinality$1.Many;
      return c2;
    }
    if (c1 === Cardinality$1.Many) {
      if (c2 === Cardinality$1.Empty) return Cardinality$1.Empty;
      return Cardinality$1.Many;
    }
    if (c1 === Cardinality$1.AtLeastOne) {
      if (c2 === Cardinality$1.AtMostOne) return Cardinality$1.Many;
      if (c2 === Cardinality$1.One) return Cardinality$1.AtLeastOne;
      return c2;
    }
    throw new Error(`Invalid Cardinality ${c1}`);
  }
  cardutil2.multiplyCardinalities = multiplyCardinalities;
  function multiplyCardinalitiesVariadic(cards) {
    if (cards.length === 0) throw new Error("Empty tuple not allowed");
    if (cards.length === 1) return cards[0];
    return cards.reduce(
      (product, card) => multiplyCardinalities(product, card),
      Cardinality$1.One
    );
  }
  cardutil2.multiplyCardinalitiesVariadic = multiplyCardinalitiesVariadic;
  function mergeCardinalities(a, b) {
    if (a === Cardinality$1.Empty) return b;
    if (b === Cardinality$1.Empty) return a;
    if (a === Cardinality$1.AtLeastOne) return Cardinality$1.AtLeastOne;
    if (b === Cardinality$1.AtLeastOne) return Cardinality$1.AtLeastOne;
    if (a === Cardinality$1.One) return Cardinality$1.AtLeastOne;
    if (b === Cardinality$1.One) return Cardinality$1.AtLeastOne;
    return Cardinality$1.Many;
  }
  cardutil2.mergeCardinalities = mergeCardinalities;
  function mergeCardinalitiesVariadic(cards) {
    if (cards.length === 0) throw new Error("Empty tuple not allowed");
    if (cards.length === 1) return cards[0];
    const [first, second, ...rest] = cards;
    if (cards.length === 2) return mergeCardinalities(first, second);
    return mergeCardinalitiesVariadic([
      mergeCardinalities(first, second),
      ...rest
    ]);
  }
  cardutil2.mergeCardinalitiesVariadic = mergeCardinalitiesVariadic;
  function orCardinalities(c1, c2) {
    if (c1 === c2 || c1 === Cardinality$1.Many) return c1;
    if (c1 === Cardinality$1.AtLeastOne) {
      if (c2 === Cardinality$1.One) return Cardinality$1.AtLeastOne;
      return Cardinality$1.Many;
    }
    if (c1 === Cardinality$1.AtMostOne) {
      if (c2 === Cardinality$1.Many || c2 === Cardinality$1.AtLeastOne) {
        return Cardinality$1.Many;
      }
      return c1;
    }
    if (c1 === Cardinality$1.Empty) {
      if (c2 === Cardinality$1.AtMostOne || c2 === Cardinality$1.One) {
        return Cardinality$1.AtMostOne;
      }
      return Cardinality$1.Many;
    }
    if (c2 === Cardinality$1.Empty) return Cardinality$1.AtMostOne;
    return c2;
  }
  cardutil2.orCardinalities = orCardinalities;
  function overrideLowerBound(card, override) {
    if (override === "One") {
      if (card === Cardinality$1.Many || card === Cardinality$1.AtLeastOne) {
        return Cardinality$1.AtLeastOne;
      } else {
        return Cardinality$1.One;
      }
    } else {
      if (card === Cardinality$1.Many || card === Cardinality$1.AtLeastOne) {
        return Cardinality$1.Many;
      } else if (card === Cardinality$1.Empty) {
        return Cardinality$1.Empty;
      } else {
        return Cardinality$1.AtMostOne;
      }
    }
  }
  cardutil2.overrideLowerBound = overrideLowerBound;
  function overrideUpperBound(card, override) {
    if (override === "One") {
      if (card === Cardinality$1.One || card === Cardinality$1.AtLeastOne) {
        return Cardinality$1.One;
      } else {
        return Cardinality$1.AtMostOne;
      }
    } else {
      if (card === Cardinality$1.One || card === Cardinality$1.AtLeastOne) {
        return Cardinality$1.AtLeastOne;
      } else {
        return Cardinality$1.Many;
      }
    }
  }
  cardutil2.overrideUpperBound = overrideUpperBound;
  function coalesceCardinalities(c1, c2) {
    if (c1 === Cardinality$1.One || c1 === Cardinality$1.AtLeastOne) return c1;
    if (c2 === Cardinality$1.One) return overrideLowerBound(c1, "One");
    if (c2 === Cardinality$1.AtLeastOne) return Cardinality$1.AtLeastOne;
    return orCardinalities(c1, c2);
  }
  cardutil2.coalesceCardinalities = coalesceCardinalities;
})(cardutil || (cardutil = {}));
function getSharedParentScalar(a, b) {
  a = a.__casttype__ || a;
  b = b.__casttype__ || b;
  if (a.__name__ === "std::number") {
    if (b.__name__ === "std::number") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "sys::VersionStage") {
    if (b.__name__ === "sys::VersionStage") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "sys::TransactionIsolation") {
    if (b.__name__ === "sys::TransactionIsolation") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "sys::TransactionDeferrability") {
    if (b.__name__ === "sys::TransactionDeferrability") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "sys::TransactionAccessMode") {
    if (b.__name__ === "sys::TransactionAccessMode") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "sys::QueryType") {
    if (b.__name__ === "sys::QueryType") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "sys::OutputFormat") {
    if (b.__name__ === "sys::OutputFormat") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::uuid") {
    if (b.__name__ === "std::uuid") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::str") {
    if (b.__name__ === "std::str") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::pg::timestamptz") {
    if (b.__name__ === "std::pg::timestamptz") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::pg::timestamp") {
    if (b.__name__ === "std::pg::timestamp") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::pg::json") {
    if (b.__name__ === "std::pg::json") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::pg::interval") {
    if (b.__name__ === "std::pg::interval") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::pg::date") {
    if (b.__name__ === "std::pg::date") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::net::http::Method") {
    if (b.__name__ === "std::net::http::Method") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::net::RequestState") {
    if (b.__name__ === "std::net::RequestState") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::net::RequestFailureKind") {
    if (b.__name__ === "std::net::RequestFailureKind") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::json") {
    if (b.__name__ === "std::json") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::int64") {
    if (b.__name__ === "std::int64") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::int32") {
    if (b.__name__ === "std::int32") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::int16") {
    if (b.__name__ === "std::int16") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::fts::document") {
    if (b.__name__ === "std::fts::document") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::fts::Weight") {
    if (b.__name__ === "std::fts::Weight") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::fts::PGLanguage") {
    if (b.__name__ === "std::fts::PGLanguage") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::fts::LuceneLanguage") {
    if (b.__name__ === "std::fts::LuceneLanguage") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::fts::Language") {
    if (b.__name__ === "std::fts::Language") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::fts::ElasticLanguage") {
    if (b.__name__ === "std::fts::ElasticLanguage") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::float64") {
    if (b.__name__ === "std::float64") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::float32") {
    if (b.__name__ === "std::float32") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::enc::Base64Alphabet") {
    if (b.__name__ === "std::enc::Base64Alphabet") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::duration") {
    if (b.__name__ === "std::duration") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::decimal") {
    if (b.__name__ === "std::decimal") {
      return b;
    }
    if (b.__name__ === "std::bigint") {
      return a;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::datetime") {
    if (b.__name__ === "std::datetime") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::cal::relative_duration") {
    if (b.__name__ === "std::cal::relative_duration") {
      return b;
    }
    if (b.__name__ === "std::cal::date_duration") {
      return a;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::cal::local_time") {
    if (b.__name__ === "std::cal::local_time") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::cal::local_datetime") {
    if (b.__name__ === "std::cal::local_datetime") {
      return b;
    }
    if (b.__name__ === "std::cal::local_date") {
      return a;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::cal::local_date") {
    if (b.__name__ === "std::cal::local_datetime") {
      return b;
    }
    if (b.__name__ === "std::cal::local_date") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::cal::date_duration") {
    if (b.__name__ === "std::cal::relative_duration") {
      return b;
    }
    if (b.__name__ === "std::cal::date_duration") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::bytes") {
    if (b.__name__ === "std::bytes") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::bool") {
    if (b.__name__ === "std::bool") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::bigint") {
    if (b.__name__ === "std::decimal") {
      return b;
    }
    if (b.__name__ === "std::bigint") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::JsonEmpty") {
    if (b.__name__ === "std::JsonEmpty") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "std::Endian") {
    if (b.__name__ === "std::Endian") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::Volatility") {
    if (b.__name__ === "schema::Volatility") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::TypeModifier") {
    if (b.__name__ === "schema::TypeModifier") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::TriggerTiming") {
    if (b.__name__ === "schema::TriggerTiming") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::TriggerScope") {
    if (b.__name__ === "schema::TriggerScope") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::TriggerKind") {
    if (b.__name__ === "schema::TriggerKind") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::TargetDeleteAction") {
    if (b.__name__ === "schema::TargetDeleteAction") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::SourceDeleteAction") {
    if (b.__name__ === "schema::SourceDeleteAction") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::RewriteKind") {
    if (b.__name__ === "schema::RewriteKind") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::ParameterKind") {
    if (b.__name__ === "schema::ParameterKind") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::OperatorKind") {
    if (b.__name__ === "schema::OperatorKind") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::MigrationGeneratedBy") {
    if (b.__name__ === "schema::MigrationGeneratedBy") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::IndexDeferrability") {
    if (b.__name__ === "schema::IndexDeferrability") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::Cardinality") {
    if (b.__name__ === "schema::Cardinality") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::AccessPolicyAction") {
    if (b.__name__ === "schema::AccessPolicyAction") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "schema::AccessKind") {
    if (b.__name__ === "schema::AccessKind") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "ext::auth::WebhookEvent") {
    if (b.__name__ === "ext::auth::WebhookEvent") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "ext::auth::JWTAlgo") {
    if (b.__name__ === "ext::auth::JWTAlgo") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "ext::auth::FlowType") {
    if (b.__name__ === "ext::auth::FlowType") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "default::EntryType") {
    if (b.__name__ === "default::EntryType") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "default::CurrencyType") {
    if (b.__name__ === "default::CurrencyType") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "default::AccountType") {
    if (b.__name__ === "default::AccountType") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "cfg::memory") {
    if (b.__name__ === "cfg::memory") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "cfg::StoreMigrationSDL") {
    if (b.__name__ === "cfg::StoreMigrationSDL") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "cfg::SMTPSecurity") {
    if (b.__name__ === "cfg::SMTPSecurity") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "cfg::QueryStatsOption") {
    if (b.__name__ === "cfg::QueryStatsOption") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "cfg::QueryCacheMode") {
    if (b.__name__ === "cfg::QueryCacheMode") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "cfg::ConnectionTransport") {
    if (b.__name__ === "cfg::ConnectionTransport") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  if (a.__name__ === "cfg::AllowBareDDL") {
    if (b.__name__ === "cfg::AllowBareDDL") {
      return b;
    }
    throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
  }
  throw new Error(`Types are not castable: ${a.__name__}, ${b.__name__}`);
}
const implicitCastMap = /* @__PURE__ */ new Map([
  ["std::cal::date_duration", /* @__PURE__ */ new Set(["std::cal::relative_duration"])],
  ["std::cal::local_date", /* @__PURE__ */ new Set(["std::cal::local_datetime"])],
  ["std::bigint", /* @__PURE__ */ new Set(["std::decimal"])]
]);
function isImplicitlyCastableTo(from, to) {
  const _a = implicitCastMap.get(from), _b = _a != null ? _a.has(to) : null;
  return _b != null ? _b : false;
}
function literalToTypeSet(type) {
  if (type && type.__element__) {
    return type;
  }
  if (typeof type === "number") {
    return $getType("00000000-0000-0000-0000-0000000001ff")(type);
  }
  if (typeof type === "string") {
    return $getType("00000000-0000-0000-0000-000000000101")(type);
  }
  if (typeof type === "boolean") {
    return $getType("00000000-0000-0000-0000-000000000109")(type);
  }
  if (typeof type === "bigint") {
    return $getType("00000000-0000-0000-0000-000000000110")(type);
  }
  if (type instanceof Uint8Array) {
    return $getType("00000000-0000-0000-0000-000000000102")(type);
  }
  if (type instanceof Date) {
    return $getType("00000000-0000-0000-0000-00000000010a")(type);
  }
  if (type instanceof gel.Duration) {
    return $getType("00000000-0000-0000-0000-00000000010e")(type);
  }
  if (type instanceof gel.ConfigMemory) {
    return $getType("00000000-0000-0000-0000-000000000130")(type);
  }
  if (type instanceof gel.LocalDateTime) {
    return $getType("00000000-0000-0000-0000-00000000010b")(type);
  }
  if (type instanceof gel.LocalDate) {
    return $getType("00000000-0000-0000-0000-00000000010c")(type);
  }
  if (type instanceof gel.LocalTime) {
    return $getType("00000000-0000-0000-0000-00000000010d")(type);
  }
  if (type instanceof gel.RelativeDuration) {
    return $getType("00000000-0000-0000-0000-000000000111")(type);
  }
  if (type instanceof gel.DateDuration) {
    return $getType("00000000-0000-0000-0000-000000000112")(type);
  }
  throw new Error(`Cannot convert literal '${type}' into scalar type`);
}
const indexSliceRegx = /^(-?\d+)(?:(:)(-?\d+)?)?|:(-?\d+)$/;
const arrayLikeProxyHandlers = {
  get(target, prop, proxy) {
    const match = typeof prop === "string" ? prop.match(indexSliceRegx) : null;
    if (match) {
      const start = match[1];
      const end = match[3] ?? match[4];
      const isIndex = start && !match[2];
      return $expressionify({
        __kind__: ExpressionKind.Operator,
        __element__: target.__element__.__kind__ === TypeKind.array && isIndex ? target.__element__.__element__ : target.__element__,
        __cardinality__: target.__cardinality__,
        __name__: "[]",
        __opkind__: "Infix",
        __args__: [
          proxy,
          isIndex ? literalToTypeSet(Number(start)) : [
            start && literalToTypeSet(Number(start)),
            end && literalToTypeSet(Number(end))
          ]
        ]
      });
    }
    return target[prop];
  }
};
function arrayLikeIndex(index) {
  const indexTypeSet = literalToTypeSet(index);
  return $expressionify({
    __kind__: ExpressionKind.Operator,
    __element__: this.__element__.__kind__ === TypeKind.array ? this.__element__.__element__ : this.__element__,
    __cardinality__: cardutil.multiplyCardinalities(
      this.__cardinality__,
      indexTypeSet.__cardinality__
    ),
    __name__: "[]",
    __opkind__: "Infix",
    __args__: [this, indexTypeSet]
  });
}
function arrayLikeSlice(start, end) {
  const startTypeSet = start && literalToTypeSet(start);
  const endTypeSet = end && literalToTypeSet(end);
  return $expressionify({
    __kind__: ExpressionKind.Operator,
    __element__: this.__element__,
    __cardinality__: cardutil.multiplyCardinalities(
      cardutil.multiplyCardinalities(
        this.__cardinality__,
        startTypeSet?.__cardinality__ ?? Cardinality$1.One
      ),
      endTypeSet?.__cardinality__ ?? Cardinality$1.One
    ),
    __name__: "[]",
    __opkind__: "Infix",
    __args__: [this, [startTypeSet, endTypeSet]]
  });
}
function $arrayLikeIndexify(_expr) {
  if (_expr.__element__.__kind__ === TypeKind.array || _expr.__element__.__kind__ === TypeKind.scalar && (_expr.__element__.__name__ === "std::str" || _expr.__element__.__name__ === "std::bytes")) {
    const expr = new Proxy(_expr, arrayLikeProxyHandlers);
    expr.index = arrayLikeIndex.bind(expr);
    expr.slice = arrayLikeSlice.bind(expr);
    return expr;
  }
  return _expr;
}
function array(arg) {
  if (Array.isArray(arg)) {
    const items = arg.map((a) => literalToTypeSet(a));
    return $expressionify({
      __kind__: ExpressionKind.Array,
      __cardinality__: cardutil.multiplyCardinalitiesVariadic(
        items.map((item) => item.__cardinality__)
      ),
      __element__: {
        __kind__: TypeKind.array,
        __name__: `array<${items[0].__element__.__name__}>`,
        __element__: items[0].__element__
      },
      __items__: items
    });
  }
  if (arg.__kind__) {
    return {
      __kind__: TypeKind.array,
      __name__: `array<${arg.__name__}>`,
      __element__: arg
    };
  }
  throw new Error("Invalid array input.");
}
const tupleProxyHandlers = {
  get(target, prop, proxy) {
    const type = target.__element__;
    const items = type.__kind__ === TypeKind.tuple ? type.__items__ : type.__kind__ === TypeKind.namedtuple ? type.__shape__ : null;
    return items && Object.prototype.hasOwnProperty.call(items, prop) ? tuplePath(proxy, items[prop], prop) : target[prop];
  }
};
function $tuplePathify(expr) {
  if (expr.__element__.__kind__ !== TypeKind.tuple && expr.__element__.__kind__ !== TypeKind.namedtuple) {
    return expr;
  }
  return new Proxy(expr, tupleProxyHandlers);
}
function tuplePath(parent, itemType, index) {
  return $expressionify({
    __kind__: ExpressionKind.TuplePath,
    __element__: itemType,
    __cardinality__: parent.__cardinality__,
    __parent__: parent,
    __index__: index
  });
}
function makeTupleType(name, items) {
  return {
    __kind__: TypeKind.tuple,
    __name__: name,
    __items__: items
  };
}
const typeKinds = new Set(Object.values(TypeKind));
function tuple$1(input) {
  if (Array.isArray(input)) {
    if (input.every((item) => typeKinds.has(item.__kind__))) {
      const typeItems = input;
      const typeName = `tuple<${typeItems.map((item) => item.__name__).join(", ")}>`;
      return makeTupleType(typeName, typeItems);
    }
    const items = input.map((item) => literalToTypeSet(item));
    const name = `tuple<${items.map((item) => item.__element__.__name__).join(", ")}>`;
    return $expressionify({
      __kind__: ExpressionKind.Tuple,
      __element__: makeTupleType(
        name,
        items.map((item) => item.__element__)
      ),
      __cardinality__: cardutil.multiplyCardinalitiesVariadic(
        items.map((i) => i.__cardinality__)
      ),
      __items__: items
    });
  } else {
    if (Object.values(input).every((el) => typeKinds.has(el.__kind__))) {
      const typeName = `tuple<${Object.entries(input).map(([key, val]) => `${key}: ${val.__name__}`).join(", ")}>`;
      return {
        __kind__: TypeKind.namedtuple,
        __name__: typeName,
        __shape__: input
      };
    }
    const exprShape = {};
    const typeShape = {};
    for (const [key, val] of Object.entries(input)) {
      const typeSet = literalToTypeSet(val);
      exprShape[key] = typeSet;
      typeShape[key] = typeSet.__element__;
    }
    const name = `tuple<${Object.entries(exprShape).map(([key, val]) => `${key}: ${val.__element__.__name__}`).join(", ")}>`;
    return $expressionify({
      __kind__: ExpressionKind.NamedTuple,
      __element__: {
        __kind__: TypeKind.namedtuple,
        __name__: name,
        __shape__: typeShape
      },
      __cardinality__: cardutil.multiplyCardinalitiesVariadic(
        Object.values(exprShape).map((val) => val.__cardinality__)
      ),
      __shape__: exprShape
    });
  }
}
function $objectTypeToTupleType(...args) {
  const [objExpr, fields] = args;
  const shape = Object.entries(objExpr.__element__.__pointers__).reduce(
    (_shape, [key, val]) => {
      if (fields?.length ? fields.includes(key) : key !== "id" && val.__kind__ === "property" && !val.computed) {
        _shape[key] = val.target;
      }
      return _shape;
    },
    {}
  );
  return tuple$1(shape);
}
function $toSet(root, card) {
  return {
    __element__: root,
    __cardinality__: card
  };
}
function isObjectType(type) {
  return type.__kind__ === TypeKind.object;
}
function isTupleType(type) {
  return type.__kind__ === TypeKind.tuple;
}
function isNamedTupleType(type) {
  return type.__kind__ === TypeKind.namedtuple;
}
function isArrayType(type) {
  return type.__kind__ === TypeKind.array;
}
const future = {
  "polymorphismAsDiscriminatedUnions": false
};
const toEdgeQLCache = /* @__PURE__ */ new WeakMap();
function $toEdgeQL() {
  if (toEdgeQLCache.has(this)) {
    return toEdgeQLCache.get(this);
  }
  const walkExprCtx = {
    seen: /* @__PURE__ */ new Map(),
    rootScope: null
  };
  walkExprTree(this, null, walkExprCtx);
  const withBlocks = /* @__PURE__ */ new Map();
  const withVars = /* @__PURE__ */ new Map();
  const seen = new Map(walkExprCtx.seen);
  const linkProps = /* @__PURE__ */ new Map();
  for (const [expr, refData] of seen) {
    seen.delete(expr);
    if (refData.linkProps.length) {
      linkProps.set(
        expr,
        refData.linkProps.map(
          (linkProp) => linkProp.__parent__.linkName.slice(1)
        )
      );
    }
    if (withVars.has(expr)) {
      continue;
    }
    if (!refData.boundScope && (expr.__kind__ === ExpressionKind.PathLeaf || expr.__kind__ === ExpressionKind.PathNode || expr.__kind__ === ExpressionKind.TypeIntersection)) {
      continue;
    }
    if (expr.__kind__ === ExpressionKind.ForVar || expr.__kind__ === ExpressionKind.Param) {
      continue;
    }
    if ((expr.__kind__ === ExpressionKind.Select || expr.__kind__ === ExpressionKind.Update || expr.__kind__ === ExpressionKind.Group) && expr.__scope__ && // with var not previously registered
    !withVars.has(expr.__scope__)) {
      const withBlock = expr;
      const scopeVar = expr.__scope__;
      const scopeVarName = `__scope_${withVars.size}_${scopeVar.__element__.__name__.replace(/[^A-Za-z]/g, "")}`;
      withVars.set(scopeVar, {
        name: scopeVarName,
        scope: withBlock,
        childExprs: /* @__PURE__ */ new Set(),
        scopedExpr: expr.__element__.__kind__ === TypeKind.object ? expr.__expr__ : void 0
      });
    }
    if (refData.refCount > 1 || refData.boundScope || refData.aliases.length > 0) {
      let withBlock = refData.boundScope?.__expr__ ?? null;
      const parentScopes = [...refData.parentScopes];
      if (!withBlock) {
        if (parentScopes.some(
          (parentScope) => parentScope && seen.has(parentScope)
        )) {
          seen.set(expr, refData);
          continue;
        }
        if (parentScopes.some((scope) => scope == null)) {
          throw new Error(
            `Cannot extract repeated expression into 'WITH' block, expression used outside of 'WITH'able expression`
          );
        }
        const [firstParentScopeChain, ...parentScopeChains] = parentScopes.map(
          (scope) => {
            const scopes = [scope];
            const pendingScopes = [scope];
            while (pendingScopes.length) {
              const currentScope = pendingScopes.shift();
              pendingScopes.push(
                ...[...walkExprCtx.seen.get(currentScope).parentScopes].filter(
                  (s) => s !== null
                )
              );
              if (!scopes.includes(currentScope)) {
                scopes.push(currentScope);
              }
            }
            return scopes;
          }
        );
        const commonParentScope = firstParentScopeChain ? firstParentScopeChain.find(
          (scope) => (
            // find the first parent scope in the chain that is shared by
            // the other parent scope chains
            parentScopeChains.every(
              (otherScope) => otherScope.includes(scope)
            )
          )
        ) : null;
        withBlock = commonParentScope ?? walkExprCtx.rootScope;
      }
      if (!withBlock) {
        throw new Error(
          `Cannot extract repeated expression into 'WITH' block, expression does not appear within common 'WITH'able expression`
        );
      }
      if (!withBlocks.has(withBlock)) {
        withBlocks.set(withBlock, /* @__PURE__ */ new Set());
      }
      if (refData.boundScope && refData.boundScope.__refs__.some(
        (ref) => ref !== expr && seen.has(ref) && walkExprCtx.seen.get(ref)?.childExprs.includes(expr)
      )) {
        seen.set(expr, refData);
        continue;
      }
      const validScopes = new Set(
        [
          withBlock,
          // expressions already explictly bound to with block are also valid scopes
          ...withBlocks.get(withBlock) ?? []
        ].flatMap((expr2) => [expr2, ...walkExprCtx.seen.get(expr2).childExprs])
      );
      for (const scope of [
        ...refData.parentScopes,
        ...util.flatMap(refData.aliases, (alias2) => [
          ...walkExprCtx.seen.get(alias2).parentScopes
        ])
      ]) {
        if (scope === null || !validScopes.has(scope)) {
          throw new Error(
            refData.boundScope ? `Expr or its aliases used outside of declared 'WITH' block scope` : `Cannot extract repeated or aliased expression into 'WITH' block, expression or its aliases appear outside root scope`
          );
        }
      }
      for (const withVar of [expr, ...refData.aliases]) {
        const withVarBoundScope = walkExprCtx.seen.get(withVar).boundScope;
        if (withVarBoundScope && withVarBoundScope !== refData.boundScope) {
          continue;
        }
        const withVarName = `__withVar_${withVars.size}`;
        withBlocks.get(withBlock).add(withVar);
        withVars.set(withVar, {
          name: withVarName,
          scope: withBlock,
          childExprs: new Set(walkExprCtx.seen.get(withVar).childExprs)
        });
      }
    }
  }
  let edgeQL = renderEdgeQL(this, {
    withBlocks,
    withVars,
    forVars: /* @__PURE__ */ new Map(),
    linkProps
  });
  if (edgeQL.startsWith("(") && edgeQL.endsWith(")") && !(this.__kind__ === ExpressionKind.Tuple || this.__kind__ === ExpressionKind.NamedTuple || this.__kind__ === ExpressionKind.Literal)) {
    edgeQL = edgeQL.slice(1, -1);
  }
  toEdgeQLCache.set(this, edgeQL);
  return edgeQL;
}
function walkExprTree(_expr, parentScope, ctx) {
  if (!_expr.__kind__) {
    throw new Error(
      `Expected a valid querybuilder expression, instead received ${typeof _expr}${typeof _expr !== "undefined" ? `: '${_expr}'` : ""}.` + getErrorHint(_expr)
    );
  }
  const expr = _expr;
  if (expr.__scopedFrom__ != null) {
    return [expr];
  }
  function walkShape(shape) {
    for (let param of Object.values(shape)) {
      if (param.__kind__ === ExpressionKind.PolyShapeElement) {
        param = param.__shapeElement__;
      }
      if (typeof param === "object") {
        if (param.__kind__) {
          childExprs.push(...walkExprTree(param, expr, ctx));
        } else {
          walkShape(param);
        }
      }
    }
  }
  if (!ctx.rootScope && parentScope) {
    ctx.rootScope = parentScope;
  }
  const seenExpr = ctx.seen.get(expr);
  if (seenExpr) {
    seenExpr.refCount += 1;
    seenExpr.parentScopes.add(parentScope);
    return [expr, ...seenExpr.childExprs];
  }
  const childExprs = [];
  ctx.seen.set(expr, {
    refCount: 1,
    parentScopes: /* @__PURE__ */ new Set([parentScope]),
    childExprs,
    boundScope: null,
    aliases: [],
    linkProps: []
  });
  switch (expr.__kind__) {
    case ExpressionKind.Alias:
      childExprs.push(...walkExprTree(expr.__expr__, parentScope, ctx));
      ctx.seen.get(expr.__expr__).aliases.push(expr);
      break;
    case ExpressionKind.With:
      childExprs.push(...walkExprTree(expr.__expr__, parentScope, ctx));
      for (const refExpr of expr.__refs__) {
        walkExprTree(refExpr, expr.__expr__, ctx);
        const seenRef = ctx.seen.get(refExpr);
        if (seenRef.childExprs.includes(expr.__expr__)) {
          throw new Error(
            `Ref expressions in with() cannot reference the expression to which the 'WITH' block is being attached. Consider wrapping the expression in a select.`
          );
        }
        if (seenRef.boundScope) {
          throw new Error(`Expression bound to multiple 'WITH' blocks`);
        }
        seenRef.boundScope = expr;
      }
      break;
    case ExpressionKind.Literal:
    case ExpressionKind.ForVar:
    case ExpressionKind.Param:
      break;
    case ExpressionKind.PathLeaf:
    case ExpressionKind.PathNode:
      if (expr.__parent__) {
        childExprs.push(
          ...walkExprTree(expr.__parent__.type, parentScope, ctx)
        );
        if (
          // is link prop
          expr.__kind__ === ExpressionKind.PathLeaf && expr.__parent__.linkName.startsWith("@")
        ) {
          const parentScopeVar = parentScope.__scope__;
          if (parentScopeVar === expr.__parent__.type) {
            ctx.seen.get(parentScope)?.linkProps.push(expr);
          }
        }
      }
      break;
    case ExpressionKind.Cast:
      if (expr.__expr__ === null) break;
      childExprs.push(...walkExprTree(expr.__expr__, parentScope, ctx));
      break;
    case ExpressionKind.Set:
      for (const subExpr of expr.__exprs__) {
        childExprs.push(...walkExprTree(subExpr, parentScope, ctx));
      }
      break;
    case ExpressionKind.Array:
      for (const subExpr of expr.__items__) {
        childExprs.push(...walkExprTree(subExpr, parentScope, ctx));
      }
      break;
    case ExpressionKind.Tuple:
      for (const subExpr of expr.__items__) {
        childExprs.push(...walkExprTree(subExpr, parentScope, ctx));
      }
      break;
    case ExpressionKind.NamedTuple:
      for (const subExpr of Object.values(expr.__shape__)) {
        childExprs.push(...walkExprTree(subExpr, parentScope, ctx));
      }
      break;
    case ExpressionKind.TuplePath:
      childExprs.push(...walkExprTree(expr.__parent__, parentScope, ctx));
      break;
    case ExpressionKind.Select:
    case ExpressionKind.Update: {
      const modifiers = expr.__modifiers__;
      if (modifiers.filter) {
        childExprs.push(...walkExprTree(modifiers.filter, expr, ctx));
      }
      if (modifiers.order_by) {
        for (const orderExpr of modifiers.order_by) {
          childExprs.push(...walkExprTree(orderExpr.expression, expr, ctx));
        }
      }
      if (modifiers.offset) {
        childExprs.push(...walkExprTree(modifiers.offset, expr, ctx));
      }
      if (modifiers.limit) {
        childExprs.push(...walkExprTree(modifiers.limit, expr, ctx));
      }
      if (expr.__kind__ === ExpressionKind.Select) {
        if (isObjectType(expr.__element__) && // don't walk shape twice if select expr justs wrap another object
        // type expr with the same shape
        expr.__element__.__shape__ !== expr.__expr__.__element__.__shape__) {
          walkShape(expr.__element__.__shape__ ?? {});
        }
      } else {
        const shape = expr.__shape__ ?? {};
        for (const _element of Object.values(shape)) {
          let element = _element;
          if (!element.__element__) {
            if (element["+="]) element = element["+="];
            else if (element["-="]) element = element["-="];
          }
          childExprs.push(...walkExprTree(element, expr, ctx));
        }
      }
      childExprs.push(...walkExprTree(expr.__expr__, expr, ctx));
      break;
    }
    case ExpressionKind.Delete: {
      childExprs.push(...walkExprTree(expr.__expr__, parentScope, ctx));
      break;
    }
    case ExpressionKind.Insert: {
      const shape = expr.__shape__ ?? {};
      for (const element of Object.values(shape)) {
        childExprs.push(...walkExprTree(element, expr, ctx));
      }
      childExprs.push(...walkExprTree(expr.__expr__, expr, ctx));
      break;
    }
    case ExpressionKind.InsertUnlessConflict: {
      const insertChildExprs = [];
      if (expr.__conflict__.on) {
        insertChildExprs.push(
          ...walkExprTree(
            expr.__conflict__.on,
            expr.__expr__,
            ctx
          )
        );
      }
      if (expr.__conflict__.else) {
        insertChildExprs.push(
          ...walkExprTree(
            expr.__conflict__.else,
            expr.__expr__,
            ctx
          )
        );
      }
      walkExprTree(expr.__expr__, parentScope, ctx);
      ctx.seen.get(expr.__expr__).childExprs.push(...insertChildExprs);
      break;
    }
    case ExpressionKind.Group: {
      const groupingSet = expr.__modifiers__.by;
      for (const [, groupExpr] of groupingSet.__exprs__) {
        const seen = /* @__PURE__ */ new Set();
        if (!seen.has(expr)) {
          childExprs.push(...walkExprTree(groupExpr, expr, ctx));
          seen.add(expr);
        }
      }
      if (!expr.__element__.__shape__.elements.__element__.__shape__) {
        throw new Error("Missing shape in GROUP statement");
      }
      walkShape(expr.__element__.__shape__.elements.__element__.__shape__);
      childExprs.push(...walkExprTree(expr.__expr__, expr, ctx));
      break;
    }
    case ExpressionKind.TypeIntersection:
      childExprs.push(...walkExprTree(expr.__expr__, parentScope, ctx));
      break;
    case ExpressionKind.Operator:
    case ExpressionKind.Function:
      for (const subExpr of expr.__args__) {
        if (Array.isArray(subExpr)) {
          for (const arg of subExpr) {
            if (arg) childExprs.push(...walkExprTree(arg, parentScope, ctx));
          }
        } else {
          childExprs.push(...walkExprTree(subExpr, parentScope, ctx));
        }
      }
      if (expr.__kind__ === ExpressionKind.Function) {
        for (const subExpr of Object.values(expr.__namedargs__)) {
          childExprs.push(...walkExprTree(subExpr, parentScope, ctx));
        }
      }
      break;
    case ExpressionKind.For: {
      childExprs.push(...walkExprTree(expr.__iterSet__, expr, ctx));
      childExprs.push(...walkExprTree(expr.__expr__, expr, ctx));
      break;
    }
    case ExpressionKind.WithParams: {
      if (parentScope !== null) {
        throw new Error(
          `'withParams' does not support being used as a nested expression`
        );
      }
      childExprs.push(...walkExprTree(expr.__expr__, parentScope, ctx));
      break;
    }
    case ExpressionKind.Detached: {
      childExprs.push(...walkExprTree(expr.__expr__, parentScope, ctx));
      break;
    }
    case ExpressionKind.Global:
      break;
    default:
      util.assertNever(
        expr,
        new Error(`Unrecognized expression kind: "${expr.__kind__}"`)
      );
  }
  return [expr, ...childExprs];
}
function renderEdgeQL(_expr, ctx, renderShape = true, noImplicitDetached = false) {
  if (!_expr.__kind__) {
    throw new Error("Invalid expression.");
  }
  const expr = _expr;
  const withVar = ctx.withVars.get(expr);
  if (withVar && ctx.renderWithVar !== expr) {
    return renderShape && expr.__kind__ === ExpressionKind.Select && isObjectType(expr.__element__) ? `(${withVar.name} ${shapeToEdgeQL(
      expr.__element__.__shape__ || {},
      ctx,
      null,
      true
      // render shape only
    )})` : withVar.name;
  }
  function renderWithBlockExpr(varExpr, _noImplicitDetached) {
    const withBlockElement = ctx.withVars.get(varExpr);
    let renderedExpr = renderEdgeQL(
      withBlockElement.scopedExpr ?? varExpr,
      {
        ...ctx,
        renderWithVar: varExpr
      },
      !withBlockElement.scopedExpr,
      // render shape if no scopedExpr exists
      _noImplicitDetached
    );
    const renderedExprNoDetached = renderEdgeQL(
      withBlockElement.scopedExpr ?? varExpr,
      {
        ...ctx,
        renderWithVar: varExpr
      },
      !withBlockElement.scopedExpr,
      // render shape if no scopedExpr exists
      true
    );
    if (ctx.linkProps.has(expr)) {
      renderedExpr = `(SELECT ${renderedExpr} {
${ctx.linkProps.get(expr).map(
        (linkPropName) => `  __linkprop_${linkPropName} := ${renderedExprNoDetached}@${linkPropName}`
      ).join(",\n")}
})`;
    }
    return `  ${withBlockElement.name} := ${renderedExpr.includes("\n") ? `(
${indent(
      renderedExpr[0] === "(" && renderedExpr[renderedExpr.length - 1] === ")" ? renderedExpr.slice(1, -1) : renderedExpr,
      4
    )}
  )` : renderedExpr}`;
  }
  const scopeExpr = (expr.__kind__ === ExpressionKind.Select || expr.__kind__ === ExpressionKind.Update || expr.__kind__ === ExpressionKind.Group) && ctx.withVars.has(expr.__scope__) ? expr.__scope__ : void 0;
  const scopeExprVar = [];
  const unscopedWithBlock = [];
  const scopedWithBlock = [];
  if (ctx.withBlocks.has(expr) || scopeExpr) {
    const sortedBlockVars = topoSortWithVars(
      ctx.withBlocks.get(expr) ?? /* @__PURE__ */ new Set(),
      ctx
    );
    if (!scopeExpr) {
      unscopedWithBlock.push(
        ...sortedBlockVars.map((blockVar) => renderWithBlockExpr(blockVar))
      );
    } else {
      const scopeVar = ctx.withVars.get(scopeExpr);
      const scopedVars = sortedBlockVars.filter(
        (blockVarExpr) => ctx.withVars.get(blockVarExpr)?.childExprs.has(scopeExpr)
      );
      unscopedWithBlock.push(
        ...sortedBlockVars.filter((blockVar) => !scopedVars.includes(blockVar)).map((blockVar) => renderWithBlockExpr(blockVar))
      );
      if (!scopedVars.length) {
        scopeExprVar.push(renderWithBlockExpr(scopeExpr, noImplicitDetached));
      } else {
        const scopeName = scopeVar.name;
        scopeVar.name = scopeName + "_expr";
        scopeExprVar.push(renderWithBlockExpr(scopeExpr, noImplicitDetached));
        scopeVar.name = scopeName + "_inner";
        scopeExprVar.push(
          `  ${scopeName} := (FOR ${scopeVar.name} IN {${scopeName + "_expr"}} UNION (
    WITH
${indent(
            scopedVars.map((blockVar) => renderWithBlockExpr(blockVar)).join(",\n"),
            4
          )}
    SELECT ${scopeVar.name} {
${scopedVars.map((blockVar) => {
            const name = ctx.withVars.get(blockVar).name;
            return `      ${name} := ${name}`;
          }).join(",\n")}
    }
  ))`
        );
        scopeVar.name = scopeName;
        for (const blockVarExpr of scopedVars) {
          const blockVar = ctx.withVars.get(blockVarExpr);
          blockVar.name = `${scopeName}.${blockVar.name}`;
        }
      }
    }
  }
  const withBlockElements = [
    ...unscopedWithBlock,
    ...scopeExprVar,
    ...scopedWithBlock
  ];
  const withBlock = withBlockElements.length ? `WITH
${withBlockElements.join(",\n")}
` : "";
  if (expr.__kind__ === ExpressionKind.With) {
    return renderEdgeQL(expr.__expr__, ctx);
  } else if (expr.__kind__ === ExpressionKind.WithParams) {
    return `(WITH
${expr.__params__.map((param) => {
      const optional2 = param.__cardinality__ === Cardinality$1.AtMostOne ? "OPTIONAL " : "";
      let paramExpr;
      if (param.__isComplex__) {
        let cast2 = param.__element__.__name__;
        cast2 = cast2.includes("std::decimal") ? `<${cast2}><${cast2.replace(/std::decimal/g, "std::str")}>` : `<${cast2}>`;
        paramExpr = `${cast2}to_json(<${optional2}str>$${param.__name__})`;
      } else {
        paramExpr = `<${optional2}${param.__element__.__name__}>$${param.__name__}`;
      }
      return `  __param__${param.__name__} := ${paramExpr}`;
    }).join(",\n")}
SELECT ${renderEdgeQL(expr.__expr__, ctx)})`;
  } else if (expr.__kind__ === ExpressionKind.Alias) {
    const aliasedExprVar = ctx.withVars.get(expr.__expr__);
    if (!aliasedExprVar) {
      throw new Error(
        `Expression referenced by alias does not exist in 'WITH' block`
      );
    }
    return aliasedExprVar.name;
  } else if (expr.__kind__ === ExpressionKind.PathNode || expr.__kind__ === ExpressionKind.PathLeaf) {
    if (!expr.__parent__) {
      return `${noImplicitDetached ? "" : "DETACHED "}${expr.__element__.__name__}`;
    } else {
      const isScopedLinkProp = expr.__parent__.linkName.startsWith("@") && ctx.withVars.has(expr.__parent__.type);
      const linkName = isScopedLinkProp ? `__linkprop_${expr.__parent__.linkName.slice(1)}` : expr.__parent__.linkName;
      const parent = renderEdgeQL(
        expr.__parent__.type,
        ctx,
        false,
        noImplicitDetached
      );
      return `${parent}${linkName.startsWith("@") ? "" : "."}${q(linkName)}`;
    }
  } else if (expr.__kind__ === ExpressionKind.Literal) {
    return literalToEdgeQL(expr.__element__, expr.__value__);
  } else if (expr.__kind__ === ExpressionKind.Set) {
    const exprs = expr.__exprs__;
    if (exprs.every((ex) => ex.__element__.__kind__ === TypeKind.object) || exprs.every((ex) => ex.__element__.__kind__ !== TypeKind.object)) {
      if (exprs.length === 0) return `<${expr.__element__.__name__}>{}`;
      return `{ ${exprs.map((ex) => renderEdgeQL(ex, ctx)).join(", ")} }`;
    } else {
      throw new Error(
        `Invalid arguments to set constructor: ${exprs.map((ex) => ex.__element__.__name__).join(", ")}`
      );
    }
  } else if (expr.__kind__ === ExpressionKind.Array) {
    return `[${expr.__items__.map((item) => renderEdgeQL(item, ctx)).join(", ")}]`;
  } else if (expr.__kind__ === ExpressionKind.Tuple) {
    return `(
${expr.__items__.map(
      (item) => `  ` + renderEdgeQL(item, ctx, renderShape, noImplicitDetached)
    ).join(",\n")}${expr.__items__.length === 1 ? "," : ""}
)`;
  } else if (expr.__kind__ === ExpressionKind.NamedTuple) {
    return `(
${Object.keys(expr.__shape__).map(
      (key) => `  ${key} := ${renderEdgeQL(
        expr.__shape__[key],
        ctx,
        renderShape,
        noImplicitDetached
      )}`
    ).join(",\n")}
)`;
  } else if (expr.__kind__ === ExpressionKind.TuplePath) {
    return `${renderEdgeQL(expr.__parent__, ctx)}.${expr.__index__}`;
  } else if (expr.__kind__ === ExpressionKind.Cast) {
    const typeName = expr.__element__.__name__ === "std::number" ? "std::float64" : expr.__element__.__name__;
    if (expr.__expr__ === null) {
      return `<${typeName}>{}`;
    }
    const rawInnerExpr = renderEdgeQL(expr.__expr__, ctx);
    const isCast = expr.__expr__.__kind__ === ExpressionKind.Cast && rawInnerExpr[0] === "(";
    const innerExpr = isCast ? rawInnerExpr.slice(1, -1) : rawInnerExpr;
    return `(<${typeName}>${innerExpr})`;
  } else if (expr.__kind__ === ExpressionKind.Select) {
    const lines = [];
    if (isObjectType(expr.__element__)) {
      const selectionTarget = renderEdgeQL(
        expr.__scope__ ?? expr.__expr__,
        ctx,
        false
      );
      lines.push(
        `SELECT${selectionTarget === "DETACHED std::FreeObject" ? "" : ` ${selectionTarget}`}`
      );
      if (expr.__element__.__shape__ !== expr.__expr__.__element__.__shape__) {
        lines.push(
          shapeToEdgeQL(
            expr.__element__.__shape__ || {},
            ctx,
            expr.__element__
          )
        );
      }
    } else {
      const needsScalarVar = (expr.__modifiers__.filter || expr.__modifiers__.order_by || expr.__modifiers__.offset || expr.__modifiers__.limit) && !ctx.withVars.has(expr.__expr__);
      lines.push(
        `SELECT ${needsScalarVar ? "_ := " : ""}${renderEdgeQL(
          expr.__expr__,
          ctx
        )}`
      );
      if (needsScalarVar) {
        ctx = { ...ctx, withVars: new Map(ctx.withVars) };
        ctx.withVars.set(expr.__expr__, {
          name: "_",
          childExprs: /* @__PURE__ */ new Set(),
          scope: expr
        });
      }
    }
    const modifiers = [];
    if (expr.__modifiers__.filter) {
      modifiers.push(`FILTER ${renderEdgeQL(expr.__modifiers__.filter, ctx)}`);
    }
    if (expr.__modifiers__.order_by) {
      modifiers.push(
        ...expr.__modifiers__.order_by.map(
          ({ expression, direction, empty }, i) => {
            return `${i === 0 ? "ORDER BY" : "  THEN"} ${renderEdgeQL(
              expression,
              ctx
            )}${direction ? " " + direction : ""}${empty ? " " + empty : ""}`;
          }
        )
      );
    }
    if (expr.__modifiers__.offset) {
      modifiers.push(
        `OFFSET ${renderEdgeQL(
          expr.__modifiers__.offset,
          ctx
        )}`
      );
    }
    if (expr.__modifiers__.limit) {
      modifiers.push(
        `LIMIT ${renderEdgeQL(
          expr.__modifiers__.limit,
          ctx
        )}`
      );
    }
    return (
      // (expr.__modifiers__.singleton ? `select assert_single((` : ``) +
      "(" + withBlock + lines.join(" ") + (modifiers.length ? "\n" + modifiers.join("\n") : "") + ")"
    );
  } else if (expr.__kind__ === ExpressionKind.Update) {
    return `(${withBlock}UPDATE ${renderEdgeQL(expr.__scope__, ctx, false)}${expr.__modifiers__.filter ? `
FILTER ${renderEdgeQL(expr.__modifiers__.filter, ctx)}
` : " "}SET ${shapeToEdgeQL(expr.__shape__, ctx, null, false, false)})`;
  } else if (expr.__kind__ === ExpressionKind.Delete) {
    return `(${withBlock}DELETE ${renderEdgeQL(
      expr.__expr__,
      ctx,
      void 0,
      noImplicitDetached
    )})`;
  } else if (expr.__kind__ === ExpressionKind.Insert) {
    return `(${withBlock}INSERT ${renderEdgeQL(
      expr.__expr__,
      ctx,
      false,
      true
    )} ${shapeToEdgeQL(expr.__shape__, ctx, null, false, false)})`;
  } else if (expr.__kind__ === ExpressionKind.InsertUnlessConflict) {
    const $on = expr.__conflict__.on;
    const $else = expr.__conflict__.else;
    const clause = [];
    if (!$on) {
      clause.push("\nUNLESS CONFLICT");
    }
    if ($on) {
      clause.push(
        `
UNLESS CONFLICT ON ${renderEdgeQL($on, ctx, false, true)}`
      );
    }
    if ($else) {
      clause.push(`
ELSE (${renderEdgeQL($else, ctx, true, true)})`);
    }
    return `(${renderEdgeQL(expr.__expr__, ctx, false, true).slice(
      1,
      -1
    )}${clause.join("")})`;
  } else if (expr.__kind__ === ExpressionKind.Group) {
    const groupingSet = expr.__modifiers__.by;
    const elementsShape = expr.__element__.__shape__.elements.__element__.__shape__;
    const selectStatement = [];
    const groupStatement = [];
    const groupTarget = renderEdgeQL(expr.__scope__, ctx, false);
    groupStatement.push(`GROUP ${groupTarget}`);
    const combinedBlock = [
      // ...scopedWithBlock,
      // this is deduplicated in e.group
      ...groupingSet.__exprs__.map(
        ([k, v]) => `  ${k} := ${renderEdgeQL(v, ctx)}`
      )
    ];
    groupStatement.push(`USING
${combinedBlock.join(",\n")}`);
    let by = renderGroupingSet(groupingSet).trim();
    if (by[0] === "(" && by[by.length - 1] === ")") {
      by = by.slice(1, by.length - 1);
    }
    groupStatement.push(`BY ` + by);
    const selectTarget = `${groupTarget}_groups`;
    selectStatement.push(
      `WITH
${[
        ...unscopedWithBlock,
        ...scopeExprVar
        // ...scopedWithBlock,
      ].join(",\n")},
  ${selectTarget} := (
${indent(groupStatement.join("\n"), 4)}
)`
    );
    const scopeVar = ctx.withVars.get(expr.__scope__);
    const elementsShapeQuery = indent(
      shapeToEdgeQL(elementsShape, { ...ctx }, expr.__element__),
      2
    ).trim().split(scopeVar.name + ".").join(`${selectTarget}.elements.`);
    selectStatement.push(`SELECT ${selectTarget} {
  key: {${groupingSet.__exprs__.map((e) => e[0]).join(", ")}},
  grouping,
  elements: ${elementsShapeQuery}
}`);
    return `(${selectStatement.join("\n")})`;
  } else if (expr.__kind__ === ExpressionKind.Function) {
    const args = expr.__args__.map(
      (arg) => `${renderEdgeQL(arg, ctx, false)}`
    );
    for (const [key, arg] of Object.entries(expr.__namedargs__)) {
      args.push(`${q(key)} := ${renderEdgeQL(arg, ctx, false)}`);
    }
    return `${expr.__name__}(${args.join(", ")})`;
  } else if (expr.__kind__ === ExpressionKind.Operator) {
    const operator = expr.__name__;
    const args = expr.__args__;
    switch (expr.__opkind__) {
      case OperatorKind$1.Infix:
        if (operator === "[]") {
          let index = "";
          if (Array.isArray(args[1])) {
            const [start, end] = args[1];
            if (start) {
              index += renderEdgeQL(start, ctx);
            }
            index += ":";
            if (end) {
              index += renderEdgeQL(end, ctx);
            }
          } else {
            index = renderEdgeQL(args[1], ctx);
          }
          return `${renderEdgeQL(args[0], ctx)}[${index}]`;
        }
        return `(${renderEdgeQL(args[0], ctx)} ${operator} ${renderEdgeQL(
          args[1],
          ctx
        )})`;
      case OperatorKind$1.Postfix:
        return `(${renderEdgeQL(args[0], ctx)} ${operator})`;
      case OperatorKind$1.Prefix:
        return `(${operator} ${renderEdgeQL(args[0], ctx)})`;
      case OperatorKind$1.Ternary:
        if (operator === "if_else") {
          return `(${renderEdgeQL(args[0], ctx)} IF ${renderEdgeQL(
            args[1],
            ctx
          )} ELSE ${renderEdgeQL(args[2], ctx)})`;
        } else {
          throw new Error(`Unknown operator: ${operator}`);
        }
      default:
        util.assertNever(
          expr.__opkind__,
          new Error(`Unknown operator kind: ${expr.__opkind__}`)
        );
    }
  } else if (expr.__kind__ === ExpressionKind.TypeIntersection) {
    return `${renderEdgeQL(expr.__expr__, ctx, false)}[IS ${expr.__element__.__name__}]`;
  } else if (expr.__kind__ === ExpressionKind.For) {
    ctx.forVars.set(expr.__forVar__, `__forVar__${ctx.forVars.size}`);
    return `(${withBlock}FOR ${ctx.forVars.get(
      expr.__forVar__
    )} IN {${renderEdgeQL(expr.__iterSet__, ctx)}}
UNION (
${indent(renderEdgeQL(expr.__expr__, ctx), 2)}
))`;
  } else if (expr.__kind__ === ExpressionKind.ForVar) {
    const forVar = ctx.forVars.get(expr);
    if (!forVar) {
      throw new Error(`'FOR' loop variable used outside of 'FOR' loop`);
    }
    return forVar;
  } else if (expr.__kind__ === ExpressionKind.Param) {
    return `__param__${expr.__name__}`;
  } else if (expr.__kind__ === ExpressionKind.Detached) {
    return `(DETACHED ${renderEdgeQL(
      expr.__expr__,
      {
        ...ctx,
        renderWithVar: expr.__expr__
      },
      void 0,
      true
    )})`;
  } else if (expr.__kind__ === ExpressionKind.Global) {
    return `(GLOBAL ${expr.__name__})`;
  } else {
    util.assertNever(
      expr,
      new Error(`Unrecognized expression kind: "${expr.__kind__}"`)
    );
  }
}
function isGroupingSet$1(arg) {
  return arg.__kind__ === "groupingset";
}
function renderGroupingSet(set2) {
  const contents = Object.entries(set2.__elements__).map(([k, v]) => {
    return isGroupingSet$1(v) ? renderGroupingSet(v) : k;
  }).join(", ");
  if (set2.__settype__ === "tuple") {
    return `(${contents})`;
  } else if (set2.__settype__ === "set") {
    return `{${contents}}`;
  } else if (set2.__settype__ === "cube") {
    return `cube(${contents})`;
  } else if (set2.__settype__ === "rollup") {
    return `rollup(${contents})`;
  } else {
    throw new Error(`Unrecognized set type: "${set2.__settype__}"`);
  }
}
function shapeToEdgeQL(shape, ctx, type = null, keysOnly = false, injectImplicitId = true) {
  const pointers = type?.__pointers__ || null;
  const isFreeObject = type?.__name__ === "std::FreeObject";
  if (shape === null) {
    return ``;
  }
  const lines = [];
  const addLine = (line) => lines.push(`${keysOnly ? "" : "  "}${line}`);
  const seen = /* @__PURE__ */ new Set();
  let hasPolyEl = false;
  for (const key in shape) {
    if (!Object.prototype.hasOwnProperty.call(shape, key)) continue;
    if (seen.has(key)) {
      console.warn(`Invalid: duplicate key "${key}"`);
      continue;
    }
    seen.add(key);
    let val = shape[key];
    let operator = ":=";
    let polyType = null;
    if (typeof val === "object" && !val.__element__) {
      if (val["+="]) {
        operator = "+=";
        val = val["+="];
      } else if (val["-="]) {
        operator = "-=";
        val = val["-="];
      }
    }
    if (val.__kind__ === ExpressionKind.PolyShapeElement) {
      polyType = val.__polyType__;
      val = val.__shapeElement__;
      hasPolyEl = true;
    }
    const polyIntersection = polyType ? `[IS ${polyType.__element__.__name__}].` : "";
    const ptr = pointers?.[key];
    const addCardinalityAnnotations = pointers && (!ptr || isFreeObject);
    const expectedCardinality = addCardinalityAnnotations && Object.prototype.hasOwnProperty.call(val, "__cardinality__") ? val.__cardinality__ === Cardinality$1.Many || val.__cardinality__ === Cardinality$1.AtLeastOne ? "multi " : "single " : "";
    const wrapAssertExists = ptr?.cardinality === Cardinality$1.AtLeastOne;
    if (typeof val === "boolean") {
      if (!pointers?.[key] && key[0] !== "@" && type && type?.__name__ !== "std::FreeObject" && !polyIntersection) {
        throw new Error(`Field "${key}" does not exist in ${type?.__name__}`);
      }
      if (val) {
        addLine(`${polyIntersection}${q(key)}`);
      }
      continue;
    }
    if (typeof val !== "object") {
      throw new Error(`Invalid shape element at "${key}".`);
    }
    const valIsExpression = Object.prototype.hasOwnProperty.call(
      val,
      "__kind__"
    );
    if (!valIsExpression) {
      addLine(
        `${polyIntersection}${q(key, false)}: ${indent(
          shapeToEdgeQL(val, ctx, ptr?.target),
          2
        ).trim()}`
      );
      continue;
    }
    if (keysOnly) {
      addLine(
        q(key, false) + (isObjectType(val.__element__) ? `: ${shapeToEdgeQL(val.__element__.__shape__, ctx, null, true)}` : "")
      );
      continue;
    }
    const renderedExpr = renderEdgeQL(val, ctx);
    addLine(
      `${expectedCardinality}${q(key, false)} ${operator} ${wrapAssertExists ? "assert_exists(" : ""}${renderedExpr.includes("\n") ? `(
${indent(
        renderedExpr[0] === "(" && renderedExpr[renderedExpr.length - 1] === ")" ? renderedExpr.slice(1, -1) : renderedExpr,
        4
      )}
  )` : renderedExpr}${wrapAssertExists ? ")" : ""}`
    );
  }
  if (lines.length === 0 && injectImplicitId) {
    addLine("id");
  }
  if (hasPolyEl && !seen.has("__typename") && future.polymorphismAsDiscriminatedUnions) ;
  return keysOnly ? `{${lines.join(", ")}}` : `{
${lines.join(",\n")}
}`;
}
function topoSortWithVars(vars, ctx) {
  if (!vars.size) {
    return [];
  }
  const sorted = [];
  const unvisited = new Set(vars);
  const visiting = /* @__PURE__ */ new Set();
  for (const withVar of unvisited) {
    visit(withVar);
  }
  function visit(withVar) {
    if (!unvisited.has(withVar)) {
      return;
    }
    if (visiting.has(withVar)) {
      throw new Error(`'WITH' variables contain a cyclic dependency`);
    }
    visiting.add(withVar);
    for (const child of ctx.withVars.get(withVar).childExprs) {
      if (vars.has(child)) {
        visit(child);
      }
    }
    visiting.delete(withVar);
    unvisited.delete(withVar);
    sorted.push(withVar);
  }
  return sorted;
}
const numericalTypes = {
  "std::number": true,
  "std::int16": true,
  "std::int32": true,
  "std::int64": true,
  "std::float32": true,
  "std::float64": true
};
function makeLabel(stringified, prefix = "jsonliteral") {
  const MAX_ITERATIONS = 100;
  let counter = 0;
  let label = `${prefix}`;
  while (stringified.includes(`$${label}$`) && counter < MAX_ITERATIONS) {
    label = `${prefix}${counter}`;
    counter++;
  }
  if (counter >= MAX_ITERATIONS) {
    throw new InputDataError(
      "Counter reached 100 without finding a unique label."
    );
  }
  return label;
}
function wrapAsRawString(val) {
  const label = makeLabel(val);
  return `$${label}$${val}$${label}$`;
}
function literalToEdgeQL(type, val) {
  const typename = type.__casttype__?.__name__ ?? type.__name__;
  let skipCast = false;
  let stringRep;
  if (typename === "std::json") {
    skipCast = true;
    const stringified = JSON.stringify(val);
    stringRep = `to_json(${wrapAsRawString(stringified)})`;
  } else if (typeof val === "string") {
    if (numericalTypes[typename]) {
      skipCast = typename === type.__name__;
      stringRep = val;
    } else if (type.__kind__ === TypeKind.enum) {
      skipCast = true;
      const vals = type.__values__;
      if (vals.includes(val)) {
        skipCast = true;
        if (val.includes(" ")) {
          stringRep = `<${type.__name__}>"${val}"`;
        } else {
          stringRep = `${type.__name__}.${q(val)}`;
        }
      } else {
        throw new Error(
          `Invalid value for type ${type.__name__}: ${JSON.stringify(val)}`
        );
      }
    } else {
      if (typename === "std::str") {
        skipCast = true;
      }
      stringRep = JSON.stringify(val);
    }
  } else if (typeof val === "number") {
    if (numericalTypes[typename]) {
      skipCast = typename === type.__name__;
    } else {
      throw new Error(`Unknown numerical type: ${type.__name__}!`);
    }
    stringRep = `${val.toString()}`;
  } else if (typeof val === "boolean") {
    stringRep = `${val.toString()}`;
    skipCast = true;
  } else if (typeof val === "bigint") {
    stringRep = `${val.toString()}n`;
  } else if (Array.isArray(val)) {
    skipCast = val.length !== 0;
    if (isArrayType(type)) {
      stringRep = `[${val.map((el) => literalToEdgeQL(type.__element__, el)).join(", ")}]`;
    } else if (isTupleType(type)) {
      stringRep = `( ${val.map((el, j) => literalToEdgeQL(type.__items__[j], el)).join(", ")}${type.__items__.length === 1 ? "," : ""} )`;
    } else {
      throw new Error(
        `Invalid value for type ${type.__name__}: ${JSON.stringify(val)}`
      );
    }
  } else if (val instanceof Date) {
    stringRep = `'${val.toISOString()}'`;
  } else if (val instanceof LocalDate || val instanceof LocalDateTime || val instanceof LocalTime || val instanceof Duration || val instanceof RelativeDuration || val instanceof DateDuration) {
    stringRep = `'${val.toString()}'`;
  } else if (val instanceof Uint8Array) {
    stringRep = bufferToStringRep(val);
    skipCast = true;
  } else if (val instanceof Float32Array) {
    stringRep = `[${val.join(",")}]`;
  } else if (val instanceof Range$1) {
    const elType = type.__element__;
    const elTypeName = elType.__name__ === "std::number" ? "std::int64" : elType.__name__;
    return `std::range(${val.lower === null ? `<${elTypeName}>{}` : literalToEdgeQL(elType, val.lower)}, ${val.upper === null ? `<${elTypeName}>{}` : literalToEdgeQL(elType, val.upper)}, inc_lower := ${val.incLower}, inc_upper := ${val.incUpper})`;
  } else if (typeof val === "object") {
    if (isNamedTupleType(type)) {
      stringRep = `( ${Object.entries(val).map(
        ([key, value]) => `${key} := ${literalToEdgeQL(type.__shape__[key], value)}`
      )} )`;
      skipCast = true;
    } else {
      throw new Error(
        `Invalid value for type ${type.__name__}: ${JSON.stringify(val)}`
      );
    }
  } else {
    throw new Error(
      `Invalid value for type ${type.__name__}: ${JSON.stringify(val)}`
    );
  }
  if (skipCast) {
    return stringRep;
  }
  return `<${type.__name__}>${stringRep}`;
}
function indent(str2, depth) {
  return str2.split("\n").map((line) => " ".repeat(depth) + line).join("\n");
}
function q(ident, allowBacklinks = true) {
  if (!ident || ident.startsWith("@") || allowBacklinks && (ident.startsWith("<") || ident.includes("::"))) {
    return ident;
  }
  const isAlphaNum = /^([^\W\d]\w*|([1-9]\d*|0))$/.test(ident);
  if (isAlphaNum) {
    const lident = ident.toLowerCase();
    const isReserved = lident !== "__type__" && lident !== "__std__" && reservedKeywords.has(lident);
    if (!isReserved) {
      return ident;
    }
  }
  return "`" + ident.replace(/`/g, "``") + "`";
}
function bufferToStringRep(buf) {
  let stringRep = "";
  for (const byte of buf) {
    if (byte < 32 || byte > 126) {
      switch (byte) {
        case 8:
          stringRep += "\\b";
          break;
        case 9:
          stringRep += "\\t";
          break;
        case 10:
          stringRep += "\\n";
          break;
        case 12:
          stringRep += "\\f";
          break;
        case 13:
          stringRep += "\\r";
          break;
        default:
          stringRep += `\\x${byte.toString(16).padStart(2, "0")}`;
      }
    } else {
      stringRep += (byte === 39 || byte === 92 ? "\\" : "") + String.fromCharCode(byte);
    }
  }
  return `b'${stringRep}'`;
}
function getErrorHint(expr) {
  let literalConstructor = null;
  switch (typeof expr) {
    case "string":
      literalConstructor = "e.str()";
      break;
    case "number":
      literalConstructor = Number.isInteger(expr) ? "e.int64()" : "e.float64()";
      break;
    case "bigint":
      literalConstructor = "e.bigint()";
      break;
    case "boolean":
      literalConstructor = "e.bool()";
      break;
  }
  switch (true) {
    case expr instanceof Date:
      literalConstructor = "e.datetime()";
      break;
    case expr instanceof Duration:
      literalConstructor = "e.duration()";
      break;
    case expr instanceof LocalDate:
      literalConstructor = "e.cal.local_date()";
      break;
    case expr instanceof LocalDateTime:
      literalConstructor = "e.cal.local_datetime()";
      break;
    case expr instanceof LocalTime:
      literalConstructor = "e.cal.local_time()";
      break;
    case expr instanceof RelativeDuration:
      literalConstructor = "e.cal.relative_duration()";
      break;
    case expr instanceof DateDuration:
      literalConstructor = "e.cal.date_duration()";
      break;
  }
  return literalConstructor ? `
Hint: Maybe you meant to wrap the value in a '${literalConstructor}' expression?` : "";
}
function jsonStringify(type, val) {
  if (type.__kind__ === TypeKind.array) {
    if (Array.isArray(val)) {
      return `[${val.map((item) => jsonStringify(type.__element__, item)).join()}]`;
    }
    throw new Error(`Param with array type is not an array`);
  }
  if (type.__kind__ === TypeKind.tuple) {
    if (!Array.isArray(val)) {
      throw new Error(`Param with tuple type is not an array`);
    }
    if (val.length !== type.__items__.length) {
      throw new Error(
        `Param with tuple type has incorrect number of items. Got ${val.length} expected ${type.__items__.length}`
      );
    }
    return `[${val.map((item, i) => jsonStringify(type.__items__[i], item)).join()}]`;
  }
  if (type.__kind__ === TypeKind.namedtuple) {
    if (typeof val !== "object") {
      throw new Error(`Param with named tuple type is not an object`);
    }
    if (Object.keys(val).length !== Object.keys(type.__shape__).length) {
      throw new Error(
        `Param with named tuple type has incorrect number of items. Got ${Object.keys(val).length} expected ${Object.keys(type.__shape__).length}`
      );
    }
    return `{${Object.entries(val).map(([key, item]) => {
      if (!type.__shape__[key]) {
        throw new Error(
          `Unexpected key in named tuple param: ${key}, expected keys: ${Object.keys(
            type.__shape__
          ).join()}`
        );
      }
      return `"${key}": ${jsonStringify(type.__shape__[key], item)}`;
    }).join()}}`;
  }
  if (type.__kind__ === TypeKind.scalar) {
    switch (type.__name__) {
      case "std::bigint":
        return val.toString();
      case "std::json":
        return JSON.stringify(val);
      case "std::bytes":
        return `"${encodeB64(val)}"`;
      case "cfg::memory":
        return `"${val.toString()}"`;
      default:
        return JSON.stringify(val);
    }
  }
  if (type.__kind__ === TypeKind.enum) {
    return JSON.stringify(val);
  }
  throw new Error(`Invalid param type: ${type.__kind__}`);
}
function jsonifyComplexParams(expr, _args) {
  if (_args && expr.__kind__ === ExpressionKind.WithParams) {
    const args = { ..._args };
    for (const param of expr.__params__) {
      if (param.__isComplex__) {
        args[param.__name__] = jsonStringify(
          param.__element__,
          args[param.__name__]
        );
      }
    }
    return args;
  }
  return _args;
}
const typeCache = /* @__PURE__ */ new Map();
const _linkProps = Symbol();
function applySpec(spec2, type, shape, seen, literal2) {
  const allPointers = [
    ...type.pointers,
    ...type.backlinks,
    ...type.backlink_stubs
  ];
  for (const ptr of allPointers) {
    if (seen.has(ptr.name)) {
      continue;
    }
    seen.add(ptr.name);
    if (ptr.kind === "link") {
      shape[ptr.name] = {
        __kind__: "link",
        cardinality: ptr.card,
        exclusive: ptr.is_exclusive,
        computed: ptr.is_computed,
        readonly: ptr.is_readonly
      };
      util.defineGetter(
        shape[ptr.name],
        "target",
        () => makeType(spec2, ptr.target_id, literal2)
      );
      util.defineGetter(shape[ptr.name], "properties", () => {
        if (!shape[ptr.name][_linkProps]) {
          const linkProperties = shape[ptr.name][_linkProps] = {};
          for (const linkProp of ptr.pointers ?? []) {
            if (linkProp.kind !== "property") {
              return;
            }
            if (linkProp.name === "source" || linkProp.name === "target") {
              return;
            }
            const linkPropObject = {
              __kind__: "property"
            };
            linkPropObject.cardinality = linkProp.card;
            util.defineGetter(linkPropObject, "target", () => {
              return makeType(spec2, linkProp.target_id, literal2);
            });
            linkProperties[linkProp.name] = linkPropObject;
          }
        }
        return shape[ptr.name][_linkProps];
      });
    } else if (ptr.kind === "property") {
      shape[ptr.name] = {
        __kind__: "property",
        cardinality: ptr.card,
        exclusive: ptr.is_exclusive,
        computed: ptr.is_computed,
        readonly: ptr.is_readonly
      };
      util.defineGetter(
        shape[ptr.name],
        "target",
        () => makeType(spec2, ptr.target_id, literal2)
      );
    }
  }
}
function applySpecToAncestors(spec2, ancestors, shape, seen, literal2) {
  for (const anc of ancestors) {
    const ancType = spec2.get(anc.id);
    if (ancType.kind === "object" || ancType.kind === "scalar") {
      ancestors.push(...ancType.bases);
    }
    if (ancType.kind !== "object") {
      throw new Error(`Not an object: ${anc.id}`);
    }
    applySpec(spec2, ancType, shape, seen, literal2);
  }
}
function getCommonPointers(arr) {
  if (arr.length === 0) return {};
  const firstObj = arr[0];
  const commonPointers = {};
  Object.keys(firstObj).forEach((key) => {
    const value = firstObj[key];
    const isCommon = arr.every((obj) => obj[key] !== void 0);
    if (isCommon) {
      commonPointers[key] = value;
    }
  });
  return commonPointers;
}
function makeType(spec2, id, literal2, anytype) {
  const type = spec2.get(id);
  if (type.name === "anytype" || type.name === "std::anypoint") {
    if (anytype) return anytype;
    throw new Error("anytype not provided");
  }
  if (typeCache.has(id)) {
    return typeCache.get(id);
  }
  const obj = {};
  obj.__name__ = type.name;
  if (type.kind === "object") {
    obj.__kind__ = TypeKind.object;
    let pointers = {};
    const seen = /* @__PURE__ */ new Set();
    applySpec(spec2, type, pointers, seen, literal2);
    const ancestors = [...type.bases];
    if (type.union_of.length) {
      const unionPointers = Array(type.union_of.length).fill(null).map(() => ({}));
      type.union_of.forEach(({ id: id2 }, index) => {
        const seen2 = /* @__PURE__ */ new Set();
        const unionType = spec2.get(id2);
        if (unionType.kind === "object") {
          applySpec(spec2, unionType, unionPointers[index], seen2, literal2);
          const ancestors2 = [...unionType.bases];
          applySpecToAncestors(
            spec2,
            ancestors2,
            unionPointers[index],
            seen2,
            literal2
          );
        }
      });
      const commonPointers = getCommonPointers(unionPointers);
      pointers = { ...pointers, ...commonPointers };
    } else {
      applySpecToAncestors(spec2, ancestors, pointers, seen, literal2);
    }
    obj.__pointers__ = pointers;
    obj.__shape__ = {};
    typeCache.set(id, obj);
    return obj;
  } else if (type.kind === "scalar") {
    const scalarObj = type.is_abstract ? {} : type.enum_values ? {} : (
      // : type.name === "std::json"
      // ? (((val: any) => {
      //     return literal(scalarObj, JSON.stringify(val));
      //   }) as any)
      (val) => {
        return literal2(scalarObj, val);
      }
    );
    if (type.enum_values) {
      scalarObj.__kind__ = TypeKind.enum;
      scalarObj.__values__ = type.enum_values;
      for (const val of type.enum_values) {
        Object.defineProperty(scalarObj, val, {
          get() {
            return literal2(scalarObj, val);
          }
        });
      }
    } else {
      scalarObj.__kind__ = TypeKind.scalar;
    }
    scalarObj.__name__ = type.name;
    if (type.cast_type) {
      scalarObj.__casttype__ = makeType(spec2, type.cast_type, literal2);
    }
    typeCache.set(id, scalarObj);
    return scalarObj;
  } else if (type.kind === "array") {
    obj.__kind__ = TypeKind.array;
    util.defineGetter(obj, "__element__", () => {
      return makeType(spec2, type.array_element_id, literal2, anytype);
    });
    util.defineGetter(obj, "__name__", () => {
      return `array<${obj.__element__.__name__}>`;
    });
    return obj;
  } else if (type.kind === "tuple") {
    if (type.tuple_elements[0].name === "0") {
      obj.__kind__ = TypeKind.tuple;
      util.defineGetter(obj, "__items__", () => {
        return type.tuple_elements.map(
          (el) => makeType(spec2, el.target_id, literal2, anytype)
        );
      });
      util.defineGetter(obj, "__name__", () => {
        return `tuple<${obj.__items__.map((item) => item.__name__).join(", ")}>`;
      });
      return obj;
    } else {
      obj.__kind__ = TypeKind.namedtuple;
      util.defineGetter(obj, "__shape__", () => {
        const shape = {};
        for (const el of type.tuple_elements) {
          shape[el.name] = makeType(spec2, el.target_id, literal2, anytype);
        }
        return shape;
      });
      util.defineGetter(obj, "__name__", () => {
        return `tuple<${Object.entries(obj.__shape__).map(([key, val]) => `${key}: ${val.__name__}`).join(", ")}>`;
      });
      return obj;
    }
  } else if (type.kind === "range") {
    obj.__kind__ = TypeKind.range;
    util.defineGetter(obj, "__element__", () => {
      return makeType(spec2, type.range_element_id, literal2, anytype);
    });
    util.defineGetter(obj, "__name__", () => {
      return `range<${obj.__element__.__name__}>`;
    });
    return obj;
  } else if (type.kind === "multirange") {
    obj.__kind__ = TypeKind.multirange;
    util.defineGetter(obj, "__element__", () => {
      return makeType(spec2, type.multirange_element_id, literal2, anytype);
    });
    util.defineGetter(obj, "__name__", () => {
      return `multirange<${obj.__element__.__name__}>`;
    });
    return obj;
  } else {
    throw new Error(`Invalid type: ${JSON.stringify(type, null, 2)}`);
  }
}
function $mergeObjectTypes(a, b) {
  const obj = {
    __kind__: TypeKind.object,
    __name__: `${a.__name__} UNION ${b.__name__}`,
    get __pointers__() {
      const merged = {};
      for (const [akey, aitem] of Object.entries(a.__pointers__)) {
        if (!b.__pointers__[akey]) continue;
        const bitem = b.__pointers__[akey];
        if (aitem.cardinality !== bitem.cardinality) continue;
        if (aitem.target.__name__ !== bitem.target.__name__) continue;
        merged[akey] = aitem;
      }
      return merged;
    },
    __shape__: {}
  };
  return obj;
}
const spec = new StrictMap();
spec.set("00000000-0000-0000-0000-000000000003", { "id": "00000000-0000-0000-0000-000000000003", "name": "anyobject", "is_abstract": false, "kind": "unknown", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000002", { "id": "00000000-0000-0000-0000-000000000002", "name": "anytuple", "is_abstract": false, "kind": "unknown", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000001", { "id": "00000000-0000-0000-0000-000000000001", "name": "anytype", "is_abstract": false, "kind": "unknown", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a6f5468c-c2a6-5852-8f73-57484b1c6831", { "id": "a6f5468c-c2a6-5852-8f73-57484b1c6831", "name": "array<anytype>", "is_abstract": true, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000001", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("076e152a-1033-5b20-86e5-b6eadf43dfe7", { "id": "076e152a-1033-5b20-86e5-b6eadf43dfe7", "name": "array<cfg::AllowBareDDL>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "50264e27-859e-5d2b-a589-ebb3d8ba4d8c", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("bf2c38cc-745d-57b7-b769-a9722f265802", { "id": "bf2c38cc-745d-57b7-b769-a9722f265802", "name": "array<cfg::ConnectionTransport>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "1adbf789-39c3-5070-bc17-776f94d59e46", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("4511ca9c-2120-586c-a5f8-f7a8255fe6ce", { "id": "4511ca9c-2120-586c-a5f8-f7a8255fe6ce", "name": "array<cfg::QueryCacheMode>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "7cb23cda-17b8-575c-9561-05e2e9351897", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("f0ba0b92-4861-5028-82a2-edc873e65700", { "id": "f0ba0b92-4861-5028-82a2-edc873e65700", "name": "array<cfg::QueryStatsOption>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "258dbe3b-cb49-5713-b9fb-b220c8065c01", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("67346a5e-de86-5fc8-a59c-63ccd350e8ef", { "id": "67346a5e-de86-5fc8-a59c-63ccd350e8ef", "name": "array<cfg::SMTPSecurity>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "6dc9f7f4-5b6b-5afc-9e5e-57a6b2f15cbc", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("098ef8fe-53aa-5402-a896-509f4833d8e2", { "id": "098ef8fe-53aa-5402-a896-509f4833d8e2", "name": "array<cfg::StoreMigrationSDL>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "43ce9f9e-00cd-5303-a1b3-fea515a046d8", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d18632a0-9f79-5926-8ccf-c2670d20bbab", { "id": "d18632a0-9f79-5926-8ccf-c2670d20bbab", "name": "array<cfg::memory>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000130", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("80e11405-f70a-11ef-8c41-ffadb2756377", { "id": "80e11405-f70a-11ef-8c41-ffadb2756377", "name": "array<default::AccountType>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "80e102ff-f70a-11ef-9f4b-6311814e8a37", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("f2154a83-fd1b-11ef-9b65-17fddfc28fb6", { "id": "f2154a83-fd1b-11ef-9b65-17fddfc28fb6", "name": "array<default::CurrencyType>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "f2153688-fd1b-11ef-9169-c92219e550e3", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("80e12d44-f70a-11ef-8eb6-e3d60bf5f7e6", { "id": "80e12d44-f70a-11ef-8eb6-e3d60bf5f7e6", "name": "array<default::EntryType>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "80e11b72-f70a-11ef-a93d-c18632c5b734", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a0103be7-ddfe-5d43-b505-fcb7bd820959", { "id": "a0103be7-ddfe-5d43-b505-fcb7bd820959", "name": "array<ext::auth::FlowType>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "f1f61c43-08ca-5ae0-870d-ace07304ca8f", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("532743df-d016-5c61-a07d-ac2ccd61dd38", { "id": "532743df-d016-5c61-a07d-ac2ccd61dd38", "name": "array<ext::auth::JWTAlgo>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "14113b4e-86a8-5b08-8ee9-9cfc1c7dc1e8", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("de4ee287-863c-59b8-8b5e-f37d68432610", { "id": "de4ee287-863c-59b8-8b5e-f37d68432610", "name": "array<ext::auth::WebhookEvent>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "8ca59fbe-2a6d-5fde-b746-99bc372de3d5", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("3ed001c4-98e8-53a8-b2d1-0cad168d926c", { "id": "3ed001c4-98e8-53a8-b2d1-0cad168d926c", "name": "array<range<std|anypoint>>", "is_abstract": true, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "49748e47-8d91-5269-9a34-2e8ca194e0f2", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("14eee508-6c7a-53b6-a0f3-a9360fa44128", { "id": "14eee508-6c7a-53b6-a0f3-a9360fa44128", "name": "array<schema::AccessKind>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "998b88fc-083a-584b-85bb-372ade248f66", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("dc4af10d-1bdc-5d7a-93b4-10a7e9a75f45", { "id": "dc4af10d-1bdc-5d7a-93b4-10a7e9a75f45", "name": "array<schema::AccessPolicyAction>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "d8c466cc-109e-587c-aff8-42e50705b5b0", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("52ee599e-5741-529f-b431-de573eb82260", { "id": "52ee599e-5741-529f-b431-de573eb82260", "name": "array<schema::Cardinality>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "94abc2f6-2e3e-55fc-8e97-b44ba70a3950", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("316c55c8-d7ab-56b1-b66b-cc92dd8c858d", { "id": "316c55c8-d7ab-56b1-b66b-cc92dd8c858d", "name": "array<schema::IndexDeferrability>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "b31b2d9a-681c-5709-bec5-321897ea5bd6", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8fd16cbd-1645-5398-8f9b-d881bb4aeb0b", { "id": "8fd16cbd-1645-5398-8f9b-d881bb4aeb0b", "name": "array<schema::MigrationGeneratedBy>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "8fcfde20-139b-5c17-93b9-9a49512b83dc", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("b55485d2-b5ef-5b30-8f8d-70a7b9946aaa", { "id": "b55485d2-b5ef-5b30-8f8d-70a7b9946aaa", "name": "array<schema::OperatorKind>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "e48403f0-7017-5bf5-ab92-22825d9f1090", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("0e05a8c0-16a7-5ad5-a8ce-7c5b328f6304", { "id": "0e05a8c0-16a7-5ad5-a8ce-7c5b328f6304", "name": "array<schema::ParameterKind>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "8037d84a-de95-5e63-ab76-727112419261", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("07ffd064-ee25-5ae8-ae6f-696065ca17ba", { "id": "07ffd064-ee25-5ae8-ae6f-696065ca17ba", "name": "array<schema::RewriteKind>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "a06f04aa-88b7-5d9a-b520-b8139fd64d0c", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("b6d3560b-59c6-5ab3-8536-3ad6958036f8", { "id": "b6d3560b-59c6-5ab3-8536-3ad6958036f8", "name": "array<schema::SourceDeleteAction>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "1c938388-8739-57a7-8095-cc173226ad8e", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("3967e4e7-34fc-50ed-9d93-b1191d6b459e", { "id": "3967e4e7-34fc-50ed-9d93-b1191d6b459e", "name": "array<schema::TargetDeleteAction>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "6b925c92-5e48-5e6d-96f2-4125d9119b66", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("60611fc3-69df-5257-a002-c37409407915", { "id": "60611fc3-69df-5257-a002-c37409407915", "name": "array<schema::TriggerKind>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "3c6fa29f-8481-59c9-a9bf-ac30ab50be32", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("3a7619f5-7a70-541d-9b98-33c05c082f3f", { "id": "3a7619f5-7a70-541d-9b98-33c05c082f3f", "name": "array<schema::TriggerScope>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "20998fe7-4392-5673-96b5-5f1cd736b5df", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8d7f7f3f-529c-5f1f-98c1-ca1730e2db41", { "id": "8d7f7f3f-529c-5f1f-98c1-ca1730e2db41", "name": "array<schema::TriggerTiming>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "a2c7e6ae-370c-53a7-842c-21e238faf3ee", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("71546d36-0e27-5d3e-99fa-1cf2d628467e", { "id": "71546d36-0e27-5d3e-99fa-1cf2d628467e", "name": "array<schema::TypeModifier>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "67722d75-1145-54b6-af26-94602de09d51", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("b8f06ef2-45d1-5290-8fb8-e46aeb1fde02", { "id": "b8f06ef2-45d1-5290-8fb8-e46aeb1fde02", "name": "array<schema::Volatility>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "de5b90f2-6e49-5543-991b-28a156c7867f", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("dc0b4639-9025-5e25-b0d0-95ed8aa02937", { "id": "dc0b4639-9025-5e25-b0d0-95ed8aa02937", "name": "array<std::Endian>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "e4a1d11b-227e-5744-a0c9-31f9cd756e7b", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d851204c-f422-584c-b13b-038291e3ac38", { "id": "d851204c-f422-584c-b13b-038291e3ac38", "name": "array<std::JsonEmpty>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "584feb89-c83d-561d-aa78-24e6d779f044", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("81e54fbd-635f-54e1-850f-7b992be06818", { "id": "81e54fbd-635f-54e1-850f-7b992be06818", "name": "array<std::bigint>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000110", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00937900-7c03-5137-acf1-e5e4b457c270", { "id": "00937900-7c03-5137-acf1-e5e4b457c270", "name": "array<std::bool>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000109", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("48aa45ef-4d93-5fbd-bfb5-81bf67b49eab", { "id": "48aa45ef-4d93-5fbd-bfb5-81bf67b49eab", "name": "array<std::bytes>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000102", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("5b410a6f-a231-524b-8682-4ce2020c1d98", { "id": "5b410a6f-a231-524b-8682-4ce2020c1d98", "name": "array<std::cal::date_duration>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000112", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8571477b-d954-5809-b360-4b1f03253699", { "id": "8571477b-d954-5809-b360-4b1f03253699", "name": "array<std::cal::local_date>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-00000000010c", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("c05958e2-0753-5a63-b7c4-db3626b0d6b5", { "id": "c05958e2-0753-5a63-b7c4-db3626b0d6b5", "name": "array<std::cal::local_datetime>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-00000000010b", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("75ba1b6e-7f51-5c49-b955-e32f20e4f72e", { "id": "75ba1b6e-7f51-5c49-b955-e32f20e4f72e", "name": "array<std::cal::local_time>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-00000000010d", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d50ba716-d5fd-5f69-8afe-9c82fe7436d9", { "id": "d50ba716-d5fd-5f69-8afe-9c82fe7436d9", "name": "array<std::cal::relative_duration>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000111", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("6494bf49-5d46-5402-8198-cdb039071f0d", { "id": "6494bf49-5d46-5402-8198-cdb039071f0d", "name": "array<std::datetime>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-00000000010a", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("7ed79f70-e306-5eea-b424-34c081809229", { "id": "7ed79f70-e306-5eea-b424-34c081809229", "name": "array<std::decimal>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000108", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2a8f8149-1ff0-554c-ac17-3a303d0ef423", { "id": "2a8f8149-1ff0-554c-ac17-3a303d0ef423", "name": "array<std::duration>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-00000000010e", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("eaa9266d-3ca5-5a9c-9446-b56f858d2a8d", { "id": "eaa9266d-3ca5-5a9c-9446-b56f858d2a8d", "name": "array<std::enc::Base64Alphabet>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "5ca96424-93ba-560a-994b-7820c9623e3d", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a2e5149c-6c82-58a4-a588-c4a064088ad5", { "id": "a2e5149c-6c82-58a4-a588-c4a064088ad5", "name": "array<std::float32>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000106", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2b65df4c-4942-59b1-8819-061ca68b2f4e", { "id": "2b65df4c-4942-59b1-8819-061ca68b2f4e", "name": "array<std::float64>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000107", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("183cac13-da68-5b1d-aac2-65e4a46fe276", { "id": "183cac13-da68-5b1d-aac2-65e4a46fe276", "name": "array<std::fts::ElasticLanguage>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "de04eafc-46d5-5037-aae6-52774a4cf421", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("455f2a01-3a09-5d87-8eb2-d21ef65315f7", { "id": "455f2a01-3a09-5d87-8eb2-d21ef65315f7", "name": "array<std::fts::Language>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "efb3a506-d101-5c65-b845-abf56604c8e3", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("c28ce254-73ff-5fea-8364-992b6664387d", { "id": "c28ce254-73ff-5fea-8364-992b6664387d", "name": "array<std::fts::LuceneLanguage>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "17c3aca3-4464-5257-bc9f-591fb7bf704c", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("23f0dc14-e618-5437-b751-27e7c992238a", { "id": "23f0dc14-e618-5437-b751-27e7c992238a", "name": "array<std::fts::PGLanguage>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "f613baf6-1ed8-557e-8f68-e91a0d39e65d", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("490b3665-0958-5498-bd04-2b5577c01f33", { "id": "490b3665-0958-5498-bd04-2b5577c01f33", "name": "array<std::fts::Weight>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "cb579c2d-cc54-54e6-9636-fff6c1643771", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("574de665-be6f-5562-a55d-448593e7b73d", { "id": "574de665-be6f-5562-a55d-448593e7b73d", "name": "array<std::int16>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000103", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("0f5eae5c-2ab0-543f-a334-b6b24e35aa2a", { "id": "0f5eae5c-2ab0-543f-a334-b6b24e35aa2a", "name": "array<std::int32>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000104", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8bf93a3b-22f6-5c02-ad98-96ad95622822", { "id": "8bf93a3b-22f6-5c02-ad98-96ad95622822", "name": "array<std::int64>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000105", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("b441b816-8f3c-5efe-9109-2d6e99b73029", { "id": "b441b816-8f3c-5efe-9109-2d6e99b73029", "name": "array<std::json>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-00000000010f", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("26a866dd-d762-5152-9164-ea5f9c0ca50d", { "id": "26a866dd-d762-5152-9164-ea5f9c0ca50d", "name": "array<std::net::RequestFailureKind>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "8b93ef2e-2ddd-5ba2-9333-2e28a4d56ede", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("7c97b406-ded1-5a84-9062-09adbdb6c7fa", { "id": "7c97b406-ded1-5a84-9062-09adbdb6c7fa", "name": "array<std::net::RequestState>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "5b46c56e-937c-59d2-b3e6-99c31c7c60f0", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("1c170d08-6188-524d-8b52-502cf2e83530", { "id": "1c170d08-6188-524d-8b52-502cf2e83530", "name": "array<std::net::http::Method>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "8896d50c-81c2-5d7d-bb2f-cb2bfba3c628", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("9a509897-f8f6-5ecc-9a8c-a69158fc0656", { "id": "9a509897-f8f6-5ecc-9a8c-a69158fc0656", "name": "array<std::pg::date>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000001000004", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("915c6d15-a5e6-5f48-9fce-0de187a09c9a", { "id": "915c6d15-a5e6-5f48-9fce-0de187a09c9a", "name": "array<std::pg::interval>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000001000005", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e2532312-99ba-5532-9e4c-18690607fcb9", { "id": "e2532312-99ba-5532-9e4c-18690607fcb9", "name": "array<std::pg::json>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000001000001", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("686d0330-45e0-50c2-88c0-07e6e0cccb5e", { "id": "686d0330-45e0-50c2-88c0-07e6e0cccb5e", "name": "array<std::pg::timestamp>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000001000003", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("ef3017b6-5eb5-5c6c-aa2c-a0915d4a9b3d", { "id": "ef3017b6-5eb5-5c6c-aa2c-a0915d4a9b3d", "name": "array<std::pg::timestamptz>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000001000002", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("bb221d39-09f1-507e-8851-62075bb61823", { "id": "bb221d39-09f1-507e-8851-62075bb61823", "name": "array<std::str>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000101", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("1378c9c3-b11a-5a95-bdac-066a4143094d", { "id": "1378c9c3-b11a-5a95-bdac-066a4143094d", "name": "array<std::uuid>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "00000000-0000-0000-0000-000000000100", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("064df4ea-1738-525d-8b99-4d5e87fdc958", { "id": "064df4ea-1738-525d-8b99-4d5e87fdc958", "name": "array<sys::OutputFormat>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "cae65a8c-a99f-5524-9872-daecdc545531", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("29437f07-9501-5fa1-b80f-8861cb1f50fc", { "id": "29437f07-9501-5fa1-b80f-8861cb1f50fc", "name": "array<sys::QueryType>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "f2887f6f-bd51-5422-8ac7-d1732fdcd17d", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a0b83290-3fbc-5823-a058-e19b65ed6b74", { "id": "a0b83290-3fbc-5823-a058-e19b65ed6b74", "name": "array<sys::TransactionAccessMode>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "775fc501-0b35-57fa-8587-cd7c53557cdf", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("3731b51b-b271-53cd-a4d6-3b1a9abe2d35", { "id": "3731b51b-b271-53cd-a4d6-3b1a9abe2d35", "name": "array<sys::TransactionDeferrability>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "2eb021ec-461e-5b65-859c-26c1eee234a1", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8daff374-5f73-5443-8de3-61e01f281c0d", { "id": "8daff374-5f73-5443-8de3-61e01f281c0d", "name": "array<sys::TransactionIsolation>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "070715f3-0100-5580-9473-696f961243eb", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("157457d9-2a7f-5bc8-a9a8-be7db7e831bf", { "id": "157457d9-2a7f-5bc8-a9a8-be7db7e831bf", "name": "array<sys::VersionStage>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "16a08f13-b1b1-57f4-8e82-062f67fb2a4c", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("212f4161-55eb-569e-945d-ae24bdab437a", { "id": "212f4161-55eb-569e-945d-ae24bdab437a", "name": "array<tuple<name:std|str, expr:std|str>>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "f5e31516-7567-519d-847f-397a0762ce23", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("cc3f58f4-ffd4-5f38-97d9-6b5844e89037", { "id": "cc3f58f4-ffd4-5f38-97d9-6b5844e89037", "name": "array<tuple<name:std|str, expr:tuple<text:std||str, refs:array<std||||uuid>>>>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "27d815f4-6518-598a-a3c5-9364342d6e06", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("29b1b6f1-a0e0-577d-adcf-e493f6b2303a", { "id": "29b1b6f1-a0e0-577d-adcf-e493f6b2303a", "name": "array<tuple<name:std|str, value:std|str>>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "08ede6a9-78ab-555f-944a-fca75d31eb5a", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("db5fcf76-8269-568c-ba2b-b36b0796b880", { "id": "db5fcf76-8269-568c-ba2b-b36b0796b880", "name": "array<tuple<text:std|str, refs:array<std||uuid>>>", "is_abstract": false, "kind": "array", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": "67996f7a-c82f-5b58-bb0a-f29764ee45c2", "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("0d14e49f-d9f9-51f0-b8f4-c432982cbac2", { "id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "name": "std::BaseObject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "id", "target_id": "00000000-0000-0000-0000-000000000100", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "__type__", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }], "exclusives": [{ "id": { "card": "One", "name": "id", "target_id": "00000000-0000-0000-0000-000000000100", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d408002f-3891-5b9a-b19c-23589a88998b", { "id": "d408002f-3891-5b9a-b19c-23589a88998b", "name": "cfg::ConfigObject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8b66e734-a01e-5638-a812-359e0d005a37", { "id": "8b66e734-a01e-5638-a812-359e0d005a37", "name": "cfg::AbstractConfig", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d408002f-3891-5b9a-b19c-23589a88998b" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "default_transaction_access_mode", "target_id": "775fc501-0b35-57fa-8587-cd7c53557cdf", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "session_idle_timeout", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "default_transaction_isolation", "target_id": "070715f3-0100-5580-9473-696f961243eb", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "default_transaction_deferrable", "target_id": "2eb021ec-461e-5b65-859c-26c1eee234a1", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "session_idle_transaction_timeout", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "query_execution_timeout", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "listen_port", "target_id": "00000000-0000-0000-0000-000000000104", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "Many", "name": "listen_addresses", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "current_email_provider_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "allow_dml_in_functions", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "allow_bare_ddl", "target_id": "50264e27-859e-5d2b-a589-ebb3d8ba4d8c", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "store_migration_sdl", "target_id": "43ce9f9e-00cd-5303-a1b3-fea515a046d8", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "apply_access_policies", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "apply_access_policies_pg", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "allow_user_specified_id", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "simple_scoping", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "warn_old_scoping", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "cors_allow_origins", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "auto_rebuild_query_cache", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "auto_rebuild_query_cache_timeout", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "query_cache_mode", "target_id": "7cb23cda-17b8-575c-9561-05e2e9351897", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "http_max_connections", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "shared_buffers", "target_id": "00000000-0000-0000-0000-000000000130", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "query_work_mem", "target_id": "00000000-0000-0000-0000-000000000130", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "maintenance_work_mem", "target_id": "00000000-0000-0000-0000-000000000130", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "effective_cache_size", "target_id": "00000000-0000-0000-0000-000000000130", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "effective_io_concurrency", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "default_statistics_target", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "force_database_error", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "_pg_prepared_statement_cache_size", "target_id": "00000000-0000-0000-0000-000000000103", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "track_query_stats", "target_id": "258dbe3b-cb49-5713-b9fb-b220c8065c01", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "extensions", "target_id": "89fb9b8b-d3b2-5075-9d1a-f5b116a0f188", "kind": "link", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "auth", "target_id": "a2ba7516-d398-5ec2-b25e-221b2f7b9e87", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "email_providers", "target_id": "0caa4e7a-7c52-5cff-aee4-920ede8a569c", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<cfg[is cfg::ExtensionConfig]", "stub": "cfg", "target_id": "89fb9b8b-d3b2-5075-9d1a-f5b116a0f188", "kind": "link", "is_exclusive": true }, { "card": "AtMostOne", "name": "<cfg[is ext::auth::AuthConfig]", "stub": "cfg", "target_id": "3e1bc003-0fc3-5ff8-9064-26627924dca5", "kind": "link", "is_exclusive": true }], "backlink_stubs": [{ "card": "Many", "name": "<cfg", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a64cb492-91a2-5ee0-890a-6caeb3e32aa5", { "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", "name": "std::anyscalar", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("48896eaf-b8af-5f80-9073-0884475d6ee5", { "id": "48896eaf-b8af-5f80-9073-0884475d6ee5", "name": "std::anyenum", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("50264e27-859e-5d2b-a589-ebb3d8ba4d8c", { "id": "50264e27-859e-5d2b-a589-ebb3d8ba4d8c", "name": "cfg::AllowBareDDL", "is_abstract": false, "kind": "scalar", "enum_values": ["AlwaysAllow", "NeverAllow"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a2ba7516-d398-5ec2-b25e-221b2f7b9e87", { "id": "a2ba7516-d398-5ec2-b25e-221b2f7b9e87", "name": "cfg::Auth", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d408002f-3891-5b9a-b19c-23589a88998b" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "priority", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }, { "card": "Many", "name": "user", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "comment", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "method", "target_id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }], "exclusives": [{ "priority": { "card": "One", "name": "priority", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] } }, { "method": { "card": "AtMostOne", "name": "method", "target_id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<auth[is cfg::AbstractConfig]", "stub": "auth", "target_id": "8b66e734-a01e-5638-a812-359e0d005a37", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<auth[is cfg::Config]", "stub": "auth", "target_id": "363133b1-e993-50a0-94d3-aa0472b1a0a7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<auth[is cfg::InstanceConfig]", "stub": "auth", "target_id": "d9e9f342-7992-544c-b6af-459302121188", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<auth[is cfg::DatabaseConfig]", "stub": "auth", "target_id": "c046988e-25f8-55b8-8d94-9e2a13d7625f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<auth[is cfg::BranchConfig]", "stub": "auth", "target_id": "b8b6fefa-f0c7-5eea-9f2f-98a5222c7c5e", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<auth", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("128fcc80-bf32-5bdc-abac-09cf1532a7c1", { "id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1", "name": "cfg::AuthMethod", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d408002f-3891-5b9a-b19c-23589a88998b" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "transports", "target_id": "1adbf789-39c3-5070-bc17-776f94d59e46", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<method[is cfg::Auth]", "stub": "method", "target_id": "a2ba7516-d398-5ec2-b25e-221b2f7b9e87", "kind": "link", "is_exclusive": true }], "backlink_stubs": [{ "card": "Many", "name": "<method", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("c046988e-25f8-55b8-8d94-9e2a13d7625f", { "id": "c046988e-25f8-55b8-8d94-9e2a13d7625f", "name": "cfg::DatabaseConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "8b66e734-a01e-5638-a812-359e0d005a37" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("b8b6fefa-f0c7-5eea-9f2f-98a5222c7c5e", { "id": "b8b6fefa-f0c7-5eea-9f2f-98a5222c7c5e", "name": "cfg::BranchConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "c046988e-25f8-55b8-8d94-9e2a13d7625f" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("363133b1-e993-50a0-94d3-aa0472b1a0a7", { "id": "363133b1-e993-50a0-94d3-aa0472b1a0a7", "name": "cfg::Config", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "8b66e734-a01e-5638-a812-359e0d005a37" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("1adbf789-39c3-5070-bc17-776f94d59e46", { "id": "1adbf789-39c3-5070-bc17-776f94d59e46", "name": "cfg::ConnectionTransport", "is_abstract": false, "kind": "scalar", "enum_values": ["TCP", "TCP_PG", "HTTP", "SIMPLE_HTTP", "HTTP_METRICS", "HTTP_HEALTH"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("0caa4e7a-7c52-5cff-aee4-920ede8a569c", { "id": "0caa4e7a-7c52-5cff-aee4-920ede8a569c", "name": "cfg::EmailProviderConfig", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d408002f-3891-5b9a-b19c-23589a88998b" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<email_providers[is cfg::AbstractConfig]", "stub": "email_providers", "target_id": "8b66e734-a01e-5638-a812-359e0d005a37", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<email_providers[is cfg::Config]", "stub": "email_providers", "target_id": "363133b1-e993-50a0-94d3-aa0472b1a0a7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<email_providers[is cfg::InstanceConfig]", "stub": "email_providers", "target_id": "d9e9f342-7992-544c-b6af-459302121188", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<email_providers[is cfg::DatabaseConfig]", "stub": "email_providers", "target_id": "c046988e-25f8-55b8-8d94-9e2a13d7625f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<email_providers[is cfg::BranchConfig]", "stub": "email_providers", "target_id": "b8b6fefa-f0c7-5eea-9f2f-98a5222c7c5e", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<email_providers", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("89fb9b8b-d3b2-5075-9d1a-f5b116a0f188", { "id": "89fb9b8b-d3b2-5075-9d1a-f5b116a0f188", "name": "cfg::ExtensionConfig", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d408002f-3891-5b9a-b19c-23589a88998b" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "cfg", "target_id": "8b66e734-a01e-5638-a812-359e0d005a37", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "cfg": { "card": "One", "name": "cfg", "target_id": "8b66e734-a01e-5638-a812-359e0d005a37", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<extensions[is cfg::AbstractConfig]", "stub": "extensions", "target_id": "8b66e734-a01e-5638-a812-359e0d005a37", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<extensions[is cfg::Config]", "stub": "extensions", "target_id": "363133b1-e993-50a0-94d3-aa0472b1a0a7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<extensions[is cfg::InstanceConfig]", "stub": "extensions", "target_id": "d9e9f342-7992-544c-b6af-459302121188", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<extensions[is cfg::DatabaseConfig]", "stub": "extensions", "target_id": "c046988e-25f8-55b8-8d94-9e2a13d7625f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<extensions[is cfg::BranchConfig]", "stub": "extensions", "target_id": "b8b6fefa-f0c7-5eea-9f2f-98a5222c7c5e", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<extensions", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d9e9f342-7992-544c-b6af-459302121188", { "id": "d9e9f342-7992-544c-b6af-459302121188", "name": "cfg::InstanceConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "8b66e734-a01e-5638-a812-359e0d005a37" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("4e795376-37e8-5381-8ae4-d621c80bbc7b", { "id": "4e795376-37e8-5381-8ae4-d621c80bbc7b", "name": "cfg::JWT", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "transports", "target_id": "1adbf789-39c3-5070-bc17-776f94d59e46", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("9df8c566-c274-5d75-a948-2d901505d7de", { "id": "9df8c566-c274-5d75-a948-2d901505d7de", "name": "cfg::Password", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "transports", "target_id": "1adbf789-39c3-5070-bc17-776f94d59e46", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("7cb23cda-17b8-575c-9561-05e2e9351897", { "id": "7cb23cda-17b8-575c-9561-05e2e9351897", "name": "cfg::QueryCacheMode", "is_abstract": false, "kind": "scalar", "enum_values": ["InMemory", "RegInline", "PgFunc", "Default"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("258dbe3b-cb49-5713-b9fb-b220c8065c01", { "id": "258dbe3b-cb49-5713-b9fb-b220c8065c01", "name": "cfg::QueryStatsOption", "is_abstract": false, "kind": "scalar", "enum_values": ["None", "All"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("ca43bc46-6dd2-55fc-98dc-358978df0f24", { "id": "ca43bc46-6dd2-55fc-98dc-358978df0f24", "name": "cfg::SCRAM", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "transports", "target_id": "1adbf789-39c3-5070-bc17-776f94d59e46", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("519a3483-0198-576f-932d-508587433ec7", { "id": "519a3483-0198-576f-932d-508587433ec7", "name": "cfg::SMTPProviderConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0caa4e7a-7c52-5cff-aee4-920ede8a569c" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "sender", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "host", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "port", "target_id": "00000000-0000-0000-0000-000000000104", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "username", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "password", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "security", "target_id": "6dc9f7f4-5b6b-5afc-9e5e-57a6b2f15cbc", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "validate_certs", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "timeout_per_email", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "timeout_per_attempt", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("6dc9f7f4-5b6b-5afc-9e5e-57a6b2f15cbc", { "id": "6dc9f7f4-5b6b-5afc-9e5e-57a6b2f15cbc", "name": "cfg::SMTPSecurity", "is_abstract": false, "kind": "scalar", "enum_values": ["PlainText", "TLS", "STARTTLS", "STARTTLSOrPlainText"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("43ce9f9e-00cd-5303-a1b3-fea515a046d8", { "id": "43ce9f9e-00cd-5303-a1b3-fea515a046d8", "name": "cfg::StoreMigrationSDL", "is_abstract": false, "kind": "scalar", "enum_values": ["AlwaysStore", "NeverStore"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("7fc09ace-4af4-5d90-a9ab-94f9bb4cdb42", { "id": "7fc09ace-4af4-5d90-a9ab-94f9bb4cdb42", "name": "cfg::Trust", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e96db572-9980-5ce1-8049-1561b3980d0e", { "id": "e96db572-9980-5ce1-8049-1561b3980d0e", "name": "cfg::mTLS", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "transports", "target_id": "1adbf789-39c3-5070-bc17-776f94d59e46", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000130", { "id": "00000000-0000-0000-0000-000000000130", "name": "cfg::memory", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("80e102ff-f70a-11ef-9f4b-6311814e8a37", { "id": "80e102ff-f70a-11ef-9f4b-6311814e8a37", "name": "default::AccountType", "is_abstract": false, "kind": "scalar", "enum_values": ["bank", "cash"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8ce8c71e-e4fa-5f73-840c-22d7eaa58588", { "id": "8ce8c71e-e4fa-5f73-840c-22d7eaa58588", "name": "std::Object", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8a26e1fc-f70a-11ef-8721-ddb397e10907", { "id": "8a26e1fc-f70a-11ef-8721-ddb397e10907", "name": "default::Currency", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "8ce8c71e-e4fa-5f73-840c-22d7eaa58588" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "symbol", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "value", "target_id": "00000000-0000-0000-0000-000000000106", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "code", "target_id": "f2153688-fd1b-11ef-9169-c92219e550e3", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("f2153688-fd1b-11ef-9169-c92219e550e3", { "id": "f2153688-fd1b-11ef-9169-c92219e550e3", "name": "default::CurrencyType", "is_abstract": false, "kind": "scalar", "enum_values": ["CAD", "EUR", "MXN", "USD"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("80e136a6-f70a-11ef-b675-37ad4fedecc7", { "id": "80e136a6-f70a-11ef-b675-37ad4fedecc7", "name": "default::Entry", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "8ce8c71e-e4fa-5f73-840c-22d7eaa58588" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "account", "target_id": "80e102ff-f70a-11ef-9f4b-6311814e8a37", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "amount", "target_id": "00000000-0000-0000-0000-000000000106", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "category", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "description", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "type", "target_id": "80e11b72-f70a-11ef-a93d-c18632c5b734", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "enteredAmount", "target_id": "00000000-0000-0000-0000-000000000106", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "enteredCurrency", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "created", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "user", "target_id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<entries[is User]", "stub": "entries", "target_id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<entries", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("80e11b72-f70a-11ef-a93d-c18632c5b734", { "id": "80e11b72-f70a-11ef-a93d-c18632c5b734", "name": "default::EntryType", "is_abstract": false, "kind": "scalar", "enum_values": ["expense", "income", "withdrawal"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("80e6e04a-f70a-11ef-be78-e1dc35b13d52", { "id": "80e6e04a-f70a-11ef-be78-e1dc35b13d52", "name": "default::Invitation", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "8ce8c71e-e4fa-5f73-840c-22d7eaa58588" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "accepted", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "sent", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "from", "target_id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "to", "target_id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("80e32bd5-f70a-11ef-94d7-43ff6af0567f", { "id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "name": "default::User", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "8ce8c71e-e4fa-5f73-840c-22d7eaa58588" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "is_admin", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtLeastOne", "name": "identity", "target_id": "6801b916-bb3e-57eb-a156-c53c7623c210", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "partners", "target_id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "entries", "target_id": "80e136a6-f70a-11ef-b675-37ad4fedecc7", "kind": "link", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "identity": { "card": "AtLeastOne", "name": "identity", "target_id": "6801b916-bb3e-57eb-a156-c53c7623c210", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }, { "email": { "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<partners[is User]", "stub": "partners", "target_id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<user[is Entry]", "stub": "user", "target_id": "80e136a6-f70a-11ef-b675-37ad4fedecc7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<from[is Invitation]", "stub": "from", "target_id": "80e6e04a-f70a-11ef-be78-e1dc35b13d52", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<to[is Invitation]", "stub": "to", "target_id": "80e6e04a-f70a-11ef-be78-e1dc35b13d52", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<from", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<partners", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<to", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<user", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("594f22fc-bbb1-5588-b7d1-ed498df6ccec", { "id": "594f22fc-bbb1-5588-b7d1-ed498df6ccec", "name": "ext::auth::ProviderConfig", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d408002f-3891-5b9a-b19c-23589a88998b" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<providers[is ext::auth::AuthConfig]", "stub": "providers", "target_id": "3e1bc003-0fc3-5ff8-9064-26627924dca5", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<providers", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("848d522a-6d9c-5317-b807-7e9b926f0a66", { "id": "848d522a-6d9c-5317-b807-7e9b926f0a66", "name": "ext::auth::OAuthProviderConfig", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "594f22fc-bbb1-5588-b7d1-ed498df6ccec" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }, { "card": "One", "name": "secret", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }, { "card": "One", "name": "client_id", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }, { "card": "One", "name": "display_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "additional_scope", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2059ae30-cb44-51d0-b016-920ef0a691b4", { "id": "2059ae30-cb44-51d0-b016-920ef0a691b4", "name": "ext::auth::AppleOAuthProvider", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "848d522a-6d9c-5317-b807-7e9b926f0a66" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "display_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("4315a540-bc94-58fa-8e95-a5816e134135", { "id": "4315a540-bc94-58fa-8e95-a5816e134135", "name": "ext::auth::Auditable", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "created_at", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "modified_at", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("3e1bc003-0fc3-5ff8-9064-26627924dca5", { "id": "3e1bc003-0fc3-5ff8-9064-26627924dca5", "name": "ext::auth::AuthConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "89fb9b8b-d3b2-5075-9d1a-f5b116a0f188" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "app_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "logo_url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "dark_logo_url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "brand_color", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "auth_signing_key", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "token_time_to_live", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "Many", "name": "allowed_redirect_urls", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "providers", "target_id": "594f22fc-bbb1-5588-b7d1-ed498df6ccec", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "ui", "target_id": "594c2313-d943-51c0-a6bb-d9d367926838", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "webhooks", "target_id": "e7891c5d-ac77-5e4b-bf98-3585ad63c382", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8e5252c0-063b-5112-8228-ec339ac035a7", { "id": "8e5252c0-063b-5112-8228-ec339ac035a7", "name": "ext::auth::AzureOAuthProvider", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "848d522a-6d9c-5317-b807-7e9b926f0a66" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "display_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("6801b916-bb3e-57eb-a156-c53c7623c210", { "id": "6801b916-bb3e-57eb-a156-c53c7623c210", "name": "ext::auth::Identity", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "4315a540-bc94-58fa-8e95-a5816e134135" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "issuer", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "subject", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "issuer": { "card": "One", "name": "issuer", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, "subject": { "card": "One", "name": "subject", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<identity[is ext::auth::PKCEChallenge]", "stub": "identity", "target_id": "559cb828-957b-5cfc-bddb-f74adc5c71be", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<identity[is User]", "stub": "identity", "target_id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<identity", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("7b736e73-4ce5-5dbe-a4a7-d0b278be5ec8", { "id": "7b736e73-4ce5-5dbe-a4a7-d0b278be5ec8", "name": "ext::auth::ClientTokenIdentity", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "6801b916-bb3e-57eb-a156-c53c7623c210" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("1211be9e-fb63-560a-be54-e82f7520fc35", { "id": "1211be9e-fb63-560a-be54-e82f7520fc35", "name": "ext::auth::DiscordOAuthProvider", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "848d522a-6d9c-5317-b807-7e9b926f0a66" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "display_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("5a4c113f-3892-5708-bf83-696857e64305", { "id": "5a4c113f-3892-5708-bf83-696857e64305", "name": "ext::auth::Factor", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "4315a540-bc94-58fa-8e95-a5816e134135" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "identity", "target_id": "78ff164d-0c30-56a8-8baa-73824f6d68c6", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "identity": { "card": "One", "name": "identity", "target_id": "78ff164d-0c30-56a8-8baa-73824f6d68c6", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("c8e5d5f3-fced-5e92-a040-af0ef7991888", { "id": "c8e5d5f3-fced-5e92-a040-af0ef7991888", "name": "ext::auth::EmailFactor", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "5a4c113f-3892-5708-bf83-696857e64305" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "verified_at", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("177397b5-4749-5b76-8062-813313551a8f", { "id": "177397b5-4749-5b76-8062-813313551a8f", "name": "ext::auth::EmailPasswordFactor", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "c8e5d5f3-fced-5e92-a040-af0ef7991888" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "password_hash", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "email": { "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("f58a65af-0293-5623-87f9-3e79d77665b7", { "id": "f58a65af-0293-5623-87f9-3e79d77665b7", "name": "ext::auth::EmailPasswordProviderConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "594f22fc-bbb1-5588-b7d1-ed498df6ccec" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "require_verification", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("f1f61c43-08ca-5ae0-870d-ace07304ca8f", { "id": "f1f61c43-08ca-5ae0-870d-ace07304ca8f", "name": "ext::auth::FlowType", "is_abstract": false, "kind": "scalar", "enum_values": ["PKCE", "Implicit"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("65ca9461-dbf9-5c42-8dd8-8e13e6bad184", { "id": "65ca9461-dbf9-5c42-8dd8-8e13e6bad184", "name": "ext::auth::GitHubOAuthProvider", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "848d522a-6d9c-5317-b807-7e9b926f0a66" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "display_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("ec577bc3-ecb3-5446-96ca-3842d9183f2f", { "id": "ec577bc3-ecb3-5446-96ca-3842d9183f2f", "name": "ext::auth::GoogleOAuthProvider", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "848d522a-6d9c-5317-b807-7e9b926f0a66" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "display_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("14113b4e-86a8-5b08-8ee9-9cfc1c7dc1e8", { "id": "14113b4e-86a8-5b08-8ee9-9cfc1c7dc1e8", "name": "ext::auth::JWTAlgo", "is_abstract": false, "kind": "scalar", "enum_values": ["RS256", "HS256"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("78ff164d-0c30-56a8-8baa-73824f6d68c6", { "id": "78ff164d-0c30-56a8-8baa-73824f6d68c6", "name": "ext::auth::LocalIdentity", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "6801b916-bb3e-57eb-a156-c53c7623c210" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "subject", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<identity[is ext::auth::Factor]", "stub": "identity", "target_id": "5a4c113f-3892-5708-bf83-696857e64305", "kind": "link", "is_exclusive": true }, { "card": "AtMostOne", "name": "<identity[is ext::auth::EmailFactor]", "stub": "identity", "target_id": "c8e5d5f3-fced-5e92-a040-af0ef7991888", "kind": "link", "is_exclusive": true }, { "card": "AtMostOne", "name": "<identity[is ext::auth::EmailPasswordFactor]", "stub": "identity", "target_id": "177397b5-4749-5b76-8062-813313551a8f", "kind": "link", "is_exclusive": true }, { "card": "AtMostOne", "name": "<identity[is ext::auth::MagicLinkFactor]", "stub": "identity", "target_id": "2e73616f-1385-54a2-9105-0381fedd24c6", "kind": "link", "is_exclusive": true }, { "card": "AtMostOne", "name": "<identity[is ext::auth::WebAuthnFactor]", "stub": "identity", "target_id": "565eca61-74f2-562e-ab89-733402d7ed0f", "kind": "link", "is_exclusive": true }], "backlink_stubs": [{ "card": "Many", "name": "<identity", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2e73616f-1385-54a2-9105-0381fedd24c6", { "id": "2e73616f-1385-54a2-9105-0381fedd24c6", "name": "ext::auth::MagicLinkFactor", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "c8e5d5f3-fced-5e92-a040-af0ef7991888" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "email": { "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("94669beb-b17f-5923-b1ce-42cdbaba861b", { "id": "94669beb-b17f-5923-b1ce-42cdbaba861b", "name": "ext::auth::MagicLinkProviderConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "594f22fc-bbb1-5588-b7d1-ed498df6ccec" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "token_time_to_live", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("c884e7ba-db13-5017-bbfa-0de47a844d91", { "id": "c884e7ba-db13-5017-bbfa-0de47a844d91", "name": "ext::auth::OpenIDConnectProvider", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "848d522a-6d9c-5317-b807-7e9b926f0a66" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }, { "card": "One", "name": "display_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] }, { "card": "One", "name": "issuer_url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "logo_url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("559cb828-957b-5cfc-bddb-f74adc5c71be", { "id": "559cb828-957b-5cfc-bddb-f74adc5c71be", "name": "ext::auth::PKCEChallenge", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "4315a540-bc94-58fa-8e95-a5816e134135" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "challenge", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "auth_token", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "refresh_token", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "id_token", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "identity", "target_id": "6801b916-bb3e-57eb-a156-c53c7623c210", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "challenge": { "card": "One", "name": "challenge", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("9952c73b-751a-59ae-b367-753d9e9ee215", { "id": "9952c73b-751a-59ae-b367-753d9e9ee215", "name": "ext::auth::SlackOAuthProvider", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "848d522a-6d9c-5317-b807-7e9b926f0a66" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "display_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("594c2313-d943-51c0-a6bb-d9d367926838", { "id": "594c2313-d943-51c0-a6bb-d9d367926838", "name": "ext::auth::UIConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d408002f-3891-5b9a-b19c-23589a88998b" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "redirect_to", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "redirect_to_on_signup", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "flow_type", "target_id": "f1f61c43-08ca-5ae0-870d-ace07304ca8f", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "app_name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "logo_url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "dark_logo_url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "brand_color", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<ui[is ext::auth::AuthConfig]", "stub": "ui", "target_id": "3e1bc003-0fc3-5ff8-9064-26627924dca5", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<ui", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("ffb4afce-f9e9-5494-83e4-d9ab262ad48e", { "id": "ffb4afce-f9e9-5494-83e4-d9ab262ad48e", "name": "ext::auth::WebAuthnAuthenticationChallenge", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "4315a540-bc94-58fa-8e95-a5816e134135" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "challenge", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtLeastOne", "name": "factors", "target_id": "565eca61-74f2-562e-ab89-733402d7ed0f", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "factors": { "card": "AtLeastOne", "name": "factors", "target_id": "565eca61-74f2-562e-ab89-733402d7ed0f", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }, { "challenge": { "card": "One", "name": "challenge", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("565eca61-74f2-562e-ab89-733402d7ed0f", { "id": "565eca61-74f2-562e-ab89-733402d7ed0f", "name": "ext::auth::WebAuthnFactor", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "c8e5d5f3-fced-5e92-a040-af0ef7991888" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "user_handle", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "credential_id", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "public_key", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "public_key": { "card": "One", "name": "public_key", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }, { "credential_id": { "card": "One", "name": "credential_id", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "AtMostOne", "name": "<factors[is ext::auth::WebAuthnAuthenticationChallenge]", "stub": "factors", "target_id": "ffb4afce-f9e9-5494-83e4-d9ab262ad48e", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<factors", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("0e105468-3e50-5c03-881d-4c2446b93ee1", { "id": "0e105468-3e50-5c03-881d-4c2446b93ee1", "name": "ext::auth::WebAuthnProviderConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "594f22fc-bbb1-5588-b7d1-ed498df6ccec" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] }, { "card": "One", "name": "relying_party_origin", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "require_verification", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": true, "has_default": true, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e6627c40-57e9-5dc8-9612-7d983ec18e2a", { "id": "e6627c40-57e9-5dc8-9612-7d983ec18e2a", "name": "ext::auth::WebAuthnRegistrationChallenge", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "4315a540-bc94-58fa-8e95-a5816e134135" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "challenge", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "user_handle", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "user_handle": { "card": "One", "name": "user_handle", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, "email": { "card": "One", "name": "email", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, "challenge": { "card": "One", "name": "challenge", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }, { "challenge": { "card": "One", "name": "challenge", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e7891c5d-ac77-5e4b-bf98-3585ad63c382", { "id": "e7891c5d-ac77-5e4b-bf98-3585ad63c382", "name": "ext::auth::WebhookConfig", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d408002f-3891-5b9a-b19c-23589a88998b" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtLeastOne", "name": "events", "target_id": "8ca59fbe-2a6d-5fde-b746-99bc372de3d5", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "signing_secret_key", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "url": { "card": "One", "name": "url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<webhooks[is ext::auth::AuthConfig]", "stub": "webhooks", "target_id": "3e1bc003-0fc3-5ff8-9064-26627924dca5", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<webhooks", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8ca59fbe-2a6d-5fde-b746-99bc372de3d5", { "id": "8ca59fbe-2a6d-5fde-b746-99bc372de3d5", "name": "ext::auth::WebhookEvent", "is_abstract": false, "kind": "scalar", "enum_values": ["IdentityCreated", "IdentityAuthenticated", "EmailFactorCreated", "EmailVerified", "EmailVerificationRequested", "PasswordResetRequested", "MagicLinkRequested"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("c3231f27-c8a1-5a0c-9830-c71206020eac", { "id": "c3231f27-c8a1-5a0c-9830-c71206020eac", "name": "multirange<std::anypoint>", "is_abstract": true, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "581b0325-a044-58d4-aa37-3a85ea671313" });
spec.set("74568c88-a8c3-5a02-9acd-64616d07ab8b", { "id": "74568c88-a8c3-5a02-9acd-64616d07ab8b", "name": "multirange<std::cal::local_date>", "is_abstract": false, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "00000000-0000-0000-0000-00000000010c" });
spec.set("37c39ed3-114c-5835-b662-80d80db0199d", { "id": "37c39ed3-114c-5835-b662-80d80db0199d", "name": "multirange<std::cal::local_datetime>", "is_abstract": false, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "00000000-0000-0000-0000-00000000010b" });
spec.set("58da8bd4-709a-50bc-b0b4-a1918b7dc2ba", { "id": "58da8bd4-709a-50bc-b0b4-a1918b7dc2ba", "name": "multirange<std::datetime>", "is_abstract": false, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "00000000-0000-0000-0000-00000000010a" });
spec.set("80da35c5-4ed6-5799-8eea-1c5923a3f8d3", { "id": "80da35c5-4ed6-5799-8eea-1c5923a3f8d3", "name": "multirange<std::decimal>", "is_abstract": false, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "00000000-0000-0000-0000-000000000108" });
spec.set("18b39277-efe3-582c-8bdc-b18f4ed46e09", { "id": "18b39277-efe3-582c-8bdc-b18f4ed46e09", "name": "multirange<std::float32>", "is_abstract": false, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "00000000-0000-0000-0000-0000000001ff" });
spec.set("75f5b5c7-f201-56a8-9fd0-bd139e69fdbe", { "id": "75f5b5c7-f201-56a8-9fd0-bd139e69fdbe", "name": "multirange<std::float64>", "is_abstract": false, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "00000000-0000-0000-0000-0000000001ff" });
spec.set("a36a494d-f2c1-5886-8e17-b0c8ba9337ff", { "id": "a36a494d-f2c1-5886-8e17-b0c8ba9337ff", "name": "multirange<std::int32>", "is_abstract": false, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "00000000-0000-0000-0000-0000000001ff" });
spec.set("da3c9da3-1b79-53d0-ae36-82026533939b", { "id": "da3c9da3-1b79-53d0-ae36-82026533939b", "name": "multirange<std::int64>", "is_abstract": false, "kind": "multirange", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": "00000000-0000-0000-0000-0000000001ff" });
spec.set("49748e47-8d91-5269-9a34-2e8ca194e0f2", { "id": "49748e47-8d91-5269-9a34-2e8ca194e0f2", "name": "range<std::anypoint>", "is_abstract": true, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "581b0325-a044-58d4-aa37-3a85ea671313", "multirange_element_id": null });
spec.set("c38cc584-72e2-5b3d-a9cc-e8e256c2dd0d", { "id": "c38cc584-72e2-5b3d-a9cc-e8e256c2dd0d", "name": "range<std::cal::local_date>", "is_abstract": false, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "00000000-0000-0000-0000-00000000010c", "multirange_element_id": null });
spec.set("44825479-8abf-55f6-93bf-572798ec8f12", { "id": "44825479-8abf-55f6-93bf-572798ec8f12", "name": "range<std::cal::local_datetime>", "is_abstract": false, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "00000000-0000-0000-0000-00000000010b", "multirange_element_id": null });
spec.set("10674aaf-8d88-5593-abe9-f7d82be5162b", { "id": "10674aaf-8d88-5593-abe9-f7d82be5162b", "name": "range<std::datetime>", "is_abstract": false, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "00000000-0000-0000-0000-00000000010a", "multirange_element_id": null });
spec.set("c61dd200-697a-5b70-9ff0-6c623a700c14", { "id": "c61dd200-697a-5b70-9ff0-6c623a700c14", "name": "range<std::decimal>", "is_abstract": false, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "00000000-0000-0000-0000-000000000108", "multirange_element_id": null });
spec.set("ef0fdfe1-43f9-5954-b804-56e9b7015ffc", { "id": "ef0fdfe1-43f9-5954-b804-56e9b7015ffc", "name": "range<std::float32>", "is_abstract": false, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "00000000-0000-0000-0000-0000000001ff", "multirange_element_id": null });
spec.set("b2f8ab6d-ebca-517d-9f16-086423c5bb9c", { "id": "b2f8ab6d-ebca-517d-9f16-086423c5bb9c", "name": "range<std::float64>", "is_abstract": false, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "00000000-0000-0000-0000-0000000001ff", "multirange_element_id": null });
spec.set("38b58945-dfd2-572c-bf7e-8cadf204a2ec", { "id": "38b58945-dfd2-572c-bf7e-8cadf204a2ec", "name": "range<std::int32>", "is_abstract": false, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "00000000-0000-0000-0000-0000000001ff", "multirange_element_id": null });
spec.set("356c02b7-20fa-5d27-90fc-aa628dd37c5e", { "id": "356c02b7-20fa-5d27-90fc-aa628dd37c5e", "name": "range<std::int64>", "is_abstract": false, "kind": "range", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": "00000000-0000-0000-0000-0000000001ff", "multirange_element_id": null });
spec.set("998b88fc-083a-584b-85bb-372ade248f66", { "id": "998b88fc-083a-584b-85bb-372ade248f66", "name": "schema::AccessKind", "is_abstract": false, "kind": "scalar", "enum_values": ["Select", "UpdateRead", "UpdateWrite", "Delete", "Insert"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("32faaa35-9475-53cf-88fc-e68ecf1be4d9", { "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9", "name": "schema::Object", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "internal", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "One", "name": "builtin", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "computed_fields", "target_id": "bb221d39-09f1-507e-8851-62075bb61823", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("145b7b6f-8fa4-5b14-bcd3-5d6d10dc25da", { "id": "145b7b6f-8fa4-5b14-bcd3-5d6d10dc25da", "name": "schema::SubclassableObject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "abstract", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "is_abstract", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "final", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "is_final", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("825a1378-6b30-5f15-82f1-1c92e57691f2", { "id": "825a1378-6b30-5f15-82f1-1c92e57691f2", "name": "schema::InheritingObject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "145b7b6f-8fa4-5b14-bcd3-5d6d10dc25da" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "inherited_fields", "target_id": "bb221d39-09f1-507e-8851-62075bb61823", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "bases", "target_id": "825a1378-6b30-5f15-82f1-1c92e57691f2", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@index", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_computed": false, "is_readonly": false }] }, { "card": "Many", "name": "ancestors", "target_id": "825a1378-6b30-5f15-82f1-1c92e57691f2", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@index", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<bases[is schema::InheritingObject]", "stub": "bases", "target_id": "825a1378-6b30-5f15-82f1-1c92e57691f2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::InheritingObject]", "stub": "ancestors", "target_id": "825a1378-6b30-5f15-82f1-1c92e57691f2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is sys::Role]", "stub": "ancestors", "target_id": "04d3804d-c37f-5969-86b2-a24309653b14", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is sys::Role]", "stub": "bases", "target_id": "04d3804d-c37f-5969-86b2-a24309653b14", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::Constraint]", "stub": "ancestors", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::Constraint]", "stub": "bases", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::ConsistencySubject]", "stub": "ancestors", "target_id": "883ec593-7428-5707-af16-d446e5d8ed28", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::ConsistencySubject]", "stub": "bases", "target_id": "883ec593-7428-5707-af16-d446e5d8ed28", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::Rewrite]", "stub": "bases", "target_id": "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::Rewrite]", "stub": "ancestors", "target_id": "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::Pointer]", "stub": "bases", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::Pointer]", "stub": "ancestors", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::Property]", "stub": "ancestors", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::Property]", "stub": "bases", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::ScalarType]", "stub": "ancestors", "target_id": "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::ScalarType]", "stub": "bases", "target_id": "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::Index]", "stub": "ancestors", "target_id": "decfa7fb-1f66-5986-be86-fc9b6c268a97", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::Index]", "stub": "bases", "target_id": "decfa7fb-1f66-5986-be86-fc9b6c268a97", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::Link]", "stub": "ancestors", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::Link]", "stub": "bases", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::AccessPolicy]", "stub": "bases", "target_id": "a8462073-0539-5640-9d9d-2db251c0b350", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::AccessPolicy]", "stub": "ancestors", "target_id": "a8462073-0539-5640-9d9d-2db251c0b350", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::Trigger]", "stub": "bases", "target_id": "2b738231-1ef7-59d0-a04c-dae012181a02", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::Trigger]", "stub": "ancestors", "target_id": "2b738231-1ef7-59d0-a04c-dae012181a02", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<ancestors[is schema::ObjectType]", "stub": "ancestors", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases[is schema::ObjectType]", "stub": "bases", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<ancestors", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<bases", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("970b2d83-85d8-5a46-a4e8-337d28abc12e", { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e", "name": "schema::AnnotationSubject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "annotations", "target_id": "273b8735-318f-53f6-9297-6f20162c9105", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@value", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a8462073-0539-5640-9d9d-2db251c0b350", { "id": "a8462073-0539-5640-9d9d-2db251c0b350", "name": "schema::AccessPolicy", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "access_kinds", "target_id": "998b88fc-083a-584b-85bb-372ade248f66", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "condition", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "action", "target_id": "d8c466cc-109e-587c-aff8-42e50705b5b0", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "errmessage", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "subject", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<access_policies[is schema::ObjectType]", "stub": "access_policies", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<access_policies", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d8c466cc-109e-587c-aff8-42e50705b5b0", { "id": "d8c466cc-109e-587c-aff8-42e50705b5b0", "name": "schema::AccessPolicyAction", "is_abstract": false, "kind": "scalar", "enum_values": ["Allow", "Deny"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("4388400b-e01d-582c-b1da-8161814835a6", { "id": "4388400b-e01d-582c-b1da-8161814835a6", "name": "schema::Alias", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("273b8735-318f-53f6-9297-6f20162c9105", { "id": "273b8735-318f-53f6-9297-6f20162c9105", "name": "schema::Annotation", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "inheritable", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<annotations[is schema::AnnotationSubject]", "stub": "annotations", "target_id": "970b2d83-85d8-5a46-a4e8-337d28abc12e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is sys::Branch]", "stub": "annotations", "target_id": "2572fefc-1810-5379-bc6e-af9b8cf3943b", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is sys::Database]", "stub": "annotations", "target_id": "fd469647-1cf1-5702-85b6-bbdb7e7f1c7e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is sys::ExtensionPackage]", "stub": "annotations", "target_id": "87787989-1e54-5529-9cc4-524cc873528d", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is sys::ExtensionPackageMigration]", "stub": "annotations", "target_id": "e3aaabec-f88b-5fe0-b06e-cea0b3d46fa8", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is sys::Role]", "stub": "annotations", "target_id": "04d3804d-c37f-5969-86b2-a24309653b14", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Annotation]", "stub": "annotations", "target_id": "273b8735-318f-53f6-9297-6f20162c9105", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Alias]", "stub": "annotations", "target_id": "4388400b-e01d-582c-b1da-8161814835a6", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Global]", "stub": "annotations", "target_id": "e1294378-bb3d-57e0-81d2-6a19ea088231", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::CallableObject]", "stub": "annotations", "target_id": "800f2df9-dd86-5681-9e3c-b529af481a9d", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Function]", "stub": "annotations", "target_id": "3a60f555-7c03-5287-b4c9-f078692a89ef", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Operator]", "stub": "annotations", "target_id": "e37bd85e-5e2f-5daa-9dd9-d21d419032be", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Cast]", "stub": "annotations", "target_id": "2b25c5a4-5ad4-5c4b-b545-574ccac3fd7f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Migration]", "stub": "annotations", "target_id": "31f74b3a-d9b1-5e35-a746-057f44c58e76", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Constraint]", "stub": "annotations", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Rewrite]", "stub": "annotations", "target_id": "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Pointer]", "stub": "annotations", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Property]", "stub": "annotations", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::ScalarType]", "stub": "annotations", "target_id": "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Index]", "stub": "annotations", "target_id": "decfa7fb-1f66-5986-be86-fc9b6c268a97", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Link]", "stub": "annotations", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::AccessPolicy]", "stub": "annotations", "target_id": "a8462073-0539-5640-9d9d-2db251c0b350", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Trigger]", "stub": "annotations", "target_id": "2b738231-1ef7-59d0-a04c-dae012181a02", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::ObjectType]", "stub": "annotations", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<annotations[is schema::Extension]", "stub": "annotations", "target_id": "b9c53751-8d28-5077-b1db-a03ea59557ed", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<annotations", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8e652319-e551-5b5c-a7bd-9591f0ef5303", { "id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "name": "schema::Type", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "145b7b6f-8fa4-5b14-bcd3-5d6d10dc25da" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "from_alias", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "is_from_alias", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<element_type[is schema::Array]", "stub": "element_type", "target_id": "283cc7a9-7bf6-5eda-a323-b4e5173f2927", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<type[is schema::TupleElement]", "stub": "type", "target_id": "9cc04b0b-11e0-5670-a8a1-441a323e12fb", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<element_type[is schema::Range]", "stub": "element_type", "target_id": "cced31f8-8167-59d7-b269-c49ae88a0ac1", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<element_type[is schema::MultiRange]", "stub": "element_type", "target_id": "800c4a49-db9d-5a39-9cf2-aa213b858616", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<type[is schema::Parameter]", "stub": "type", "target_id": "87f7d583-3e3c-507e-9fbb-4bf3b9e5aa24", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<return_type[is schema::CallableObject]", "stub": "return_type", "target_id": "800f2df9-dd86-5681-9e3c-b529af481a9d", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<type[is schema::Alias]", "stub": "type", "target_id": "4388400b-e01d-582c-b1da-8161814835a6", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<target[is schema::Pointer]", "stub": "target", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<target[is schema::Global]", "stub": "target", "target_id": "e1294378-bb3d-57e0-81d2-6a19ea088231", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<from_type[is schema::Cast]", "stub": "from_type", "target_id": "2b25c5a4-5ad4-5c4b-b545-574ccac3fd7f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<to_type[is schema::Cast]", "stub": "to_type", "target_id": "2b25c5a4-5ad4-5c4b-b545-574ccac3fd7f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<element_type[is schema::ArrayExprAlias]", "stub": "element_type", "target_id": "2e55d7f5-18ed-54b4-ade0-ba404dd482d3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<element_type[is schema::RangeExprAlias]", "stub": "element_type", "target_id": "bc63491c-2a88-5353-b5f0-6f2188a4f65d", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<element_type[is schema::MultiRangeExprAlias]", "stub": "element_type", "target_id": "a92ef6fd-611e-5b00-8115-cc0ebb5f0be5", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<return_type[is schema::Function]", "stub": "return_type", "target_id": "3a60f555-7c03-5287-b4c9-f078692a89ef", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<return_type[is schema::Operator]", "stub": "return_type", "target_id": "e37bd85e-5e2f-5daa-9dd9-d21d419032be", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<return_type[is schema::Constraint]", "stub": "return_type", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<target[is schema::Property]", "stub": "target", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<element_type", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<from_type", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<return_type", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<target", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<to_type", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<type", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("da26fa09-3541-5cba-b93f-d5ba58d25589", { "id": "da26fa09-3541-5cba-b93f-d5ba58d25589", "name": "schema::PrimitiveType", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "8e652319-e551-5b5c-a7bd-9591f0ef5303" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e3a7ccf7-4a20-5151-80b3-5156c9373889", { "id": "e3a7ccf7-4a20-5151-80b3-5156c9373889", "name": "schema::CollectionType", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "da26fa09-3541-5cba-b93f-d5ba58d25589" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("283cc7a9-7bf6-5eda-a323-b4e5173f2927", { "id": "283cc7a9-7bf6-5eda-a323-b4e5173f2927", "name": "schema::Array", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "e3a7ccf7-4a20-5151-80b3-5156c9373889" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "dimensions", "target_id": "574de665-be6f-5562-a55d-448593e7b73d", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "element_type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2e55d7f5-18ed-54b4-ade0-ba404dd482d3", { "id": "2e55d7f5-18ed-54b4-ade0-ba404dd482d3", "name": "schema::ArrayExprAlias", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "283cc7a9-7bf6-5eda-a323-b4e5173f2927" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("800f2df9-dd86-5681-9e3c-b529af481a9d", { "id": "800f2df9-dd86-5681-9e3c-b529af481a9d", "name": "schema::CallableObject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "return_typemod", "target_id": "67722d75-1145-54b6-af26-94602de09d51", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "params", "target_id": "87f7d583-3e3c-507e-9fbb-4bf3b9e5aa24", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@index", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_computed": false, "is_readonly": false }] }, { "card": "AtMostOne", "name": "return_type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("94abc2f6-2e3e-55fc-8e97-b44ba70a3950", { "id": "94abc2f6-2e3e-55fc-8e97-b44ba70a3950", "name": "schema::Cardinality", "is_abstract": false, "kind": "scalar", "enum_values": ["One", "Many"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("ed8e20ca-f2dc-5626-bccb-05ef9ed65791", { "id": "ed8e20ca-f2dc-5626-bccb-05ef9ed65791", "name": "schema::VolatilitySubject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "volatility", "target_id": "de5b90f2-6e49-5543-991b-28a156c7867f", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2b25c5a4-5ad4-5c4b-b545-574ccac3fd7f", { "id": "2b25c5a4-5ad4-5c4b-b545-574ccac3fd7f", "name": "schema::Cast", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }, { "id": "ed8e20ca-f2dc-5626-bccb-05ef9ed65791" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "allow_implicit", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "allow_assignment", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "from_type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "to_type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("883ec593-7428-5707-af16-d446e5d8ed28", { "id": "883ec593-7428-5707-af16-d446e5d8ed28", "name": "schema::ConsistencySubject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "constraints", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [{ "constraints": { "card": "Many", "name": "constraints", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] } }], "backlinks": [{ "card": "Many", "name": "<subject[is schema::Constraint]", "stub": "subject", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<subject", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("9346c403-6ee6-50b6-81b2-a35551cfab2f", { "id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "name": "schema::Constraint", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "800f2df9-dd86-5681-9e3c-b529af481a9d" }, { "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "subjectexpr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "finalexpr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "errmessage", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "delegated", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "except_expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "subject", "target_id": "883ec593-7428-5707-af16-d446e5d8ed28", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "params", "target_id": "87f7d583-3e3c-507e-9fbb-4bf3b9e5aa24", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@index", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@value", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<constraints[is schema::ConsistencySubject]", "stub": "constraints", "target_id": "883ec593-7428-5707-af16-d446e5d8ed28", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<constraints[is schema::Pointer]", "stub": "constraints", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<constraints[is schema::Property]", "stub": "constraints", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<constraints[is schema::ScalarType]", "stub": "constraints", "target_id": "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<constraints[is schema::Link]", "stub": "constraints", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<constraints[is schema::ObjectType]", "stub": "constraints", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<constraints", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("c974be74-46d8-5848-b2a9-be5eda14f73e", { "id": "c974be74-46d8-5848-b2a9-be5eda14f73e", "name": "schema::Delta", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "parents", "target_id": "c974be74-46d8-5848-b2a9-be5eda14f73e", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<parents[is schema::Delta]", "stub": "parents", "target_id": "c974be74-46d8-5848-b2a9-be5eda14f73e", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<parents", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("b9c53751-8d28-5077-b1db-a03ea59557ed", { "id": "b9c53751-8d28-5077-b1db-a03ea59557ed", "name": "schema::Extension", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }, { "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "package", "target_id": "87787989-1e54-5529-9cc4-524cc873528d", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "package": { "card": "One", "name": "package", "target_id": "87787989-1e54-5529-9cc4-524cc873528d", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("3a60f555-7c03-5287-b4c9-f078692a89ef", { "id": "3a60f555-7c03-5287-b4c9-f078692a89ef", "name": "schema::Function", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "800f2df9-dd86-5681-9e3c-b529af481a9d" }, { "id": "ed8e20ca-f2dc-5626-bccb-05ef9ed65791" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "preserves_optionality", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }, { "card": "AtMostOne", "name": "body", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "language", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "used_globals", "target_id": "e1294378-bb3d-57e0-81d2-6a19ea088231", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@index", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("003feed0-dc7d-564e-abb5-93a42ba99d64", { "id": "003feed0-dc7d-564e-abb5-93a42ba99d64", "name": "schema::FutureBehavior", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e1294378-bb3d-57e0-81d2-6a19ea088231", { "id": "e1294378-bb3d-57e0-81d2-6a19ea088231", "name": "schema::Global", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "default", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "required", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "cardinality", "target_id": "94abc2f6-2e3e-55fc-8e97-b44ba70a3950", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "target", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<used_globals[is schema::Function]", "stub": "used_globals", "target_id": "3a60f555-7c03-5287-b4c9-f078692a89ef", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<used_globals", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("decfa7fb-1f66-5986-be86-fc9b6c268a97", { "id": "decfa7fb-1f66-5986-be86-fc9b6c268a97", "name": "schema::Index", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "except_expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "deferrability", "target_id": "b31b2d9a-681c-5709-bec5-321897ea5bd6", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "deferred", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "kwargs", "target_id": "212f4161-55eb-569e-945d-ae24bdab437a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "params", "target_id": "87f7d583-3e3c-507e-9fbb-4bf3b9e5aa24", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@index", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<indexes[is schema::Source]", "stub": "indexes", "target_id": "0368bb5e-ae06-5c00-9316-15095185b828", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<indexes[is schema::ObjectType]", "stub": "indexes", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<indexes[is schema::Link]", "stub": "indexes", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<indexes", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("b31b2d9a-681c-5709-bec5-321897ea5bd6", { "id": "b31b2d9a-681c-5709-bec5-321897ea5bd6", "name": "schema::IndexDeferrability", "is_abstract": false, "kind": "scalar", "enum_values": ["Prohibited", "Permitted", "Required"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", { "id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "name": "schema::Pointer", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "883ec593-7428-5707-af16-d446e5d8ed28" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "cardinality", "target_id": "94abc2f6-2e3e-55fc-8e97-b44ba70a3950", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "required", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "readonly", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "default", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "secret", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "source", "target_id": "0368bb5e-ae06-5c00-9316-15095185b828", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "target", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "rewrites", "target_id": "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [{ "rewrites": { "card": "Many", "name": "rewrites", "target_id": "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] } }], "backlinks": [{ "card": "AtMostOne", "name": "<pointers[is schema::Source]", "stub": "pointers", "target_id": "0368bb5e-ae06-5c00-9316-15095185b828", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<subject[is schema::Rewrite]", "stub": "subject", "target_id": "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<pointers[is schema::Link]", "stub": "pointers", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<pointers[is schema::ObjectType]", "stub": "pointers", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<pointers", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<subject", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("0368bb5e-ae06-5c00-9316-15095185b828", { "id": "0368bb5e-ae06-5c00-9316-15095185b828", "name": "schema::Source", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "Many", "name": "pointers", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] }, { "card": "Many", "name": "indexes", "target_id": "decfa7fb-1f66-5986-be86-fc9b6c268a97", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [{ "pointers": { "card": "Many", "name": "pointers", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] } }, { "indexes": { "card": "Many", "name": "indexes", "target_id": "decfa7fb-1f66-5986-be86-fc9b6c268a97", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] } }], "backlinks": [{ "card": "Many", "name": "<source[is schema::Pointer]", "stub": "source", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<source[is schema::Property]", "stub": "source", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<source[is schema::Link]", "stub": "source", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<source", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("98fe77cc-128e-58fe-b87a-1251c3288548", { "id": "98fe77cc-128e-58fe-b87a-1251c3288548", "name": "schema::Link", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3" }, { "id": "0368bb5e-ae06-5c00-9316-15095185b828" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "on_target_delete", "target_id": "6b925c92-5e48-5e6d-96f2-4125d9119b66", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "on_source_delete", "target_id": "1c938388-8739-57a7-8095-cc173226ad8e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "target", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "properties", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<links[is schema::ObjectType]", "stub": "links", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<links", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("31f74b3a-d9b1-5e35-a746-057f44c58e76", { "id": "31f74b3a-d9b1-5e35-a746-057f44c58e76", "name": "schema::Migration", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }, { "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "script", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "sdl", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "message", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "generated_by", "target_id": "8fcfde20-139b-5c17-93b9-9a49512b83dc", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "parents", "target_id": "31f74b3a-d9b1-5e35-a746-057f44c58e76", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<parents[is schema::Migration]", "stub": "parents", "target_id": "31f74b3a-d9b1-5e35-a746-057f44c58e76", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<parents", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8fcfde20-139b-5c17-93b9-9a49512b83dc", { "id": "8fcfde20-139b-5c17-93b9-9a49512b83dc", "name": "schema::MigrationGeneratedBy", "is_abstract": false, "kind": "scalar", "enum_values": ["DevMode", "DDLStatement"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("7106039a-ed86-5868-8227-3e2fc5e3e5ec", { "id": "7106039a-ed86-5868-8227-3e2fc5e3e5ec", "name": "schema::Module", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }, { "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("800c4a49-db9d-5a39-9cf2-aa213b858616", { "id": "800c4a49-db9d-5a39-9cf2-aa213b858616", "name": "schema::MultiRange", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "e3a7ccf7-4a20-5151-80b3-5156c9373889" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "element_type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a92ef6fd-611e-5b00-8115-cc0ebb5f0be5", { "id": "a92ef6fd-611e-5b00-8115-cc0ebb5f0be5", "name": "schema::MultiRangeExprAlias", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "800c4a49-db9d-5a39-9cf2-aa213b858616" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2662a1b4-4f3f-5875-b6eb-ce52101a90a3", { "id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "name": "schema::ObjectType", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0368bb5e-ae06-5c00-9316-15095185b828" }, { "id": "883ec593-7428-5707-af16-d446e5d8ed28" }, { "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "8e652319-e551-5b5c-a7bd-9591f0ef5303" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "compound_type", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "is_compound_type", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "union_of", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "intersection_of", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "links", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "properties", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "access_policies", "target_id": "a8462073-0539-5640-9d9d-2db251c0b350", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] }, { "card": "Many", "name": "triggers", "target_id": "2b738231-1ef7-59d0-a04c-dae012181a02", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [{ "triggers": { "card": "Many", "name": "triggers", "target_id": "2b738231-1ef7-59d0-a04c-dae012181a02", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] } }, { "access_policies": { "card": "Many", "name": "access_policies", "target_id": "a8462073-0539-5640-9d9d-2db251c0b350", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }, { "card": "AtMostOne", "name": "@is_owned", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_computed": false, "is_readonly": false }] } }], "backlinks": [{ "card": "Many", "name": "<__type__[is std::BaseObject]", "stub": "__type__", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::TupleElement]", "stub": "__type__", "target_id": "9cc04b0b-11e0-5670-a8a1-441a323e12fb", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Object]", "stub": "__type__", "target_id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::VolatilitySubject]", "stub": "__type__", "target_id": "ed8e20ca-f2dc-5626-bccb-05ef9ed65791", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::SubclassableObject]", "stub": "__type__", "target_id": "145b7b6f-8fa4-5b14-bcd3-5d6d10dc25da", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::InheritingObject]", "stub": "__type__", "target_id": "825a1378-6b30-5f15-82f1-1c92e57691f2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Delta]", "stub": "__type__", "target_id": "c974be74-46d8-5848-b2a9-be5eda14f73e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::AnnotationSubject]", "stub": "__type__", "target_id": "970b2d83-85d8-5a46-a4e8-337d28abc12e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is std::Object]", "stub": "__type__", "target_id": "8ce8c71e-e4fa-5f73-840c-22d7eaa58588", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<union_of[is schema::ObjectType]", "stub": "union_of", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<intersection_of[is schema::ObjectType]", "stub": "intersection_of", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<subject[is schema::AccessPolicy]", "stub": "subject", "target_id": "a8462073-0539-5640-9d9d-2db251c0b350", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<subject[is schema::Trigger]", "stub": "subject", "target_id": "2b738231-1ef7-59d0-a04c-dae012181a02", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::FutureBehavior]", "stub": "__type__", "target_id": "003feed0-dc7d-564e-abb5-93a42ba99d64", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is sys::SystemObject]", "stub": "__type__", "target_id": "43f8d5e9-5b2e-535b-a46b-acf8af101718", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is sys::ExternalObject]", "stub": "__type__", "target_id": "e3838826-d523-59f9-86f4-be3cecdf0d4f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is sys::Branch]", "stub": "__type__", "target_id": "2572fefc-1810-5379-bc6e-af9b8cf3943b", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is sys::Database]", "stub": "__type__", "target_id": "fd469647-1cf1-5702-85b6-bbdb7e7f1c7e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is sys::ExtensionPackage]", "stub": "__type__", "target_id": "87787989-1e54-5529-9cc4-524cc873528d", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is sys::ExtensionPackageMigration]", "stub": "__type__", "target_id": "e3aaabec-f88b-5fe0-b06e-cea0b3d46fa8", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is sys::Role]", "stub": "__type__", "target_id": "04d3804d-c37f-5969-86b2-a24309653b14", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is sys::QueryStats]", "stub": "__type__", "target_id": "ce92490c-1d17-5950-8bdd-cf9e23817551", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::ConfigObject]", "stub": "__type__", "target_id": "d408002f-3891-5b9a-b19c-23589a88998b", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::AuthMethod]", "stub": "__type__", "target_id": "128fcc80-bf32-5bdc-abac-09cf1532a7c1", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::Trust]", "stub": "__type__", "target_id": "7fc09ace-4af4-5d90-a9ab-94f9bb4cdb42", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::SCRAM]", "stub": "__type__", "target_id": "ca43bc46-6dd2-55fc-98dc-358978df0f24", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::JWT]", "stub": "__type__", "target_id": "4e795376-37e8-5381-8ae4-d621c80bbc7b", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::Password]", "stub": "__type__", "target_id": "9df8c566-c274-5d75-a948-2d901505d7de", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::mTLS]", "stub": "__type__", "target_id": "e96db572-9980-5ce1-8049-1561b3980d0e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::Auth]", "stub": "__type__", "target_id": "a2ba7516-d398-5ec2-b25e-221b2f7b9e87", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::EmailProviderConfig]", "stub": "__type__", "target_id": "0caa4e7a-7c52-5cff-aee4-920ede8a569c", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::SMTPProviderConfig]", "stub": "__type__", "target_id": "519a3483-0198-576f-932d-508587433ec7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::AbstractConfig]", "stub": "__type__", "target_id": "8b66e734-a01e-5638-a812-359e0d005a37", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::ExtensionConfig]", "stub": "__type__", "target_id": "89fb9b8b-d3b2-5075-9d1a-f5b116a0f188", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::Config]", "stub": "__type__", "target_id": "363133b1-e993-50a0-94d3-aa0472b1a0a7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::InstanceConfig]", "stub": "__type__", "target_id": "d9e9f342-7992-544c-b6af-459302121188", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Annotation]", "stub": "__type__", "target_id": "273b8735-318f-53f6-9297-6f20162c9105", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::DatabaseConfig]", "stub": "__type__", "target_id": "c046988e-25f8-55b8-8d94-9e2a13d7625f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is cfg::BranchConfig]", "stub": "__type__", "target_id": "b8b6fefa-f0c7-5eea-9f2f-98a5222c7c5e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is std::net::http::Response]", "stub": "__type__", "target_id": "6f217eab-7720-5bbc-8b1f-b02098bc9a4e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is std::net::http::ScheduledRequest]", "stub": "__type__", "target_id": "e6bf05a7-60c7-51dd-b30d-c8fce5bcadfd", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Type]", "stub": "__type__", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::PrimitiveType]", "stub": "__type__", "target_id": "da26fa09-3541-5cba-b93f-d5ba58d25589", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::CollectionType]", "stub": "__type__", "target_id": "e3a7ccf7-4a20-5151-80b3-5156c9373889", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Array]", "stub": "__type__", "target_id": "283cc7a9-7bf6-5eda-a323-b4e5173f2927", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::ArrayExprAlias]", "stub": "__type__", "target_id": "2e55d7f5-18ed-54b4-ade0-ba404dd482d3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Tuple]", "stub": "__type__", "target_id": "d88b4a0c-9561-56f4-b0a9-7b24027b4de8", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::TupleExprAlias]", "stub": "__type__", "target_id": "b7744aa3-50fc-54e0-ae51-20d78737e25b", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Range]", "stub": "__type__", "target_id": "cced31f8-8167-59d7-b269-c49ae88a0ac1", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::RangeExprAlias]", "stub": "__type__", "target_id": "bc63491c-2a88-5353-b5f0-6f2188a4f65d", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::MultiRange]", "stub": "__type__", "target_id": "800c4a49-db9d-5a39-9cf2-aa213b858616", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::MultiRangeExprAlias]", "stub": "__type__", "target_id": "a92ef6fd-611e-5b00-8115-cc0ebb5f0be5", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Alias]", "stub": "__type__", "target_id": "4388400b-e01d-582c-b1da-8161814835a6", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Global]", "stub": "__type__", "target_id": "e1294378-bb3d-57e0-81d2-6a19ea088231", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Parameter]", "stub": "__type__", "target_id": "87f7d583-3e3c-507e-9fbb-4bf3b9e5aa24", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::CallableObject]", "stub": "__type__", "target_id": "800f2df9-dd86-5681-9e3c-b529af481a9d", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Function]", "stub": "__type__", "target_id": "3a60f555-7c03-5287-b4c9-f078692a89ef", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Operator]", "stub": "__type__", "target_id": "e37bd85e-5e2f-5daa-9dd9-d21d419032be", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Cast]", "stub": "__type__", "target_id": "2b25c5a4-5ad4-5c4b-b545-574ccac3fd7f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Migration]", "stub": "__type__", "target_id": "31f74b3a-d9b1-5e35-a746-057f44c58e76", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Module]", "stub": "__type__", "target_id": "7106039a-ed86-5868-8227-3e2fc5e3e5ec", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::PseudoType]", "stub": "__type__", "target_id": "0875f8c3-7033-5cc4-af04-2b6d80e289e0", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Constraint]", "stub": "__type__", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::ConsistencySubject]", "stub": "__type__", "target_id": "883ec593-7428-5707-af16-d446e5d8ed28", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Rewrite]", "stub": "__type__", "target_id": "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Pointer]", "stub": "__type__", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Property]", "stub": "__type__", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::ScalarType]", "stub": "__type__", "target_id": "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Index]", "stub": "__type__", "target_id": "decfa7fb-1f66-5986-be86-fc9b6c268a97", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Source]", "stub": "__type__", "target_id": "0368bb5e-ae06-5c00-9316-15095185b828", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Link]", "stub": "__type__", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<target[is schema::Link]", "stub": "target", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::AccessPolicy]", "stub": "__type__", "target_id": "a8462073-0539-5640-9d9d-2db251c0b350", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Trigger]", "stub": "__type__", "target_id": "2b738231-1ef7-59d0-a04c-dae012181a02", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::ObjectType]", "stub": "__type__", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is schema::Extension]", "stub": "__type__", "target_id": "b9c53751-8d28-5077-b1db-a03ea59557ed", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::Auditable]", "stub": "__type__", "target_id": "4315a540-bc94-58fa-8e95-a5816e134135", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::Identity]", "stub": "__type__", "target_id": "6801b916-bb3e-57eb-a156-c53c7623c210", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::LocalIdentity]", "stub": "__type__", "target_id": "78ff164d-0c30-56a8-8baa-73824f6d68c6", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::Factor]", "stub": "__type__", "target_id": "5a4c113f-3892-5708-bf83-696857e64305", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::EmailFactor]", "stub": "__type__", "target_id": "c8e5d5f3-fced-5e92-a040-af0ef7991888", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::EmailPasswordFactor]", "stub": "__type__", "target_id": "177397b5-4749-5b76-8062-813313551a8f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::MagicLinkFactor]", "stub": "__type__", "target_id": "2e73616f-1385-54a2-9105-0381fedd24c6", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::WebAuthnFactor]", "stub": "__type__", "target_id": "565eca61-74f2-562e-ab89-733402d7ed0f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::WebAuthnRegistrationChallenge]", "stub": "__type__", "target_id": "e6627c40-57e9-5dc8-9612-7d983ec18e2a", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::WebAuthnAuthenticationChallenge]", "stub": "__type__", "target_id": "ffb4afce-f9e9-5494-83e4-d9ab262ad48e", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::PKCEChallenge]", "stub": "__type__", "target_id": "559cb828-957b-5cfc-bddb-f74adc5c71be", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::ProviderConfig]", "stub": "__type__", "target_id": "594f22fc-bbb1-5588-b7d1-ed498df6ccec", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::OAuthProviderConfig]", "stub": "__type__", "target_id": "848d522a-6d9c-5317-b807-7e9b926f0a66", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::OpenIDConnectProvider]", "stub": "__type__", "target_id": "c884e7ba-db13-5017-bbfa-0de47a844d91", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::AppleOAuthProvider]", "stub": "__type__", "target_id": "2059ae30-cb44-51d0-b016-920ef0a691b4", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::AzureOAuthProvider]", "stub": "__type__", "target_id": "8e5252c0-063b-5112-8228-ec339ac035a7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::DiscordOAuthProvider]", "stub": "__type__", "target_id": "1211be9e-fb63-560a-be54-e82f7520fc35", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::SlackOAuthProvider]", "stub": "__type__", "target_id": "9952c73b-751a-59ae-b367-753d9e9ee215", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::GitHubOAuthProvider]", "stub": "__type__", "target_id": "65ca9461-dbf9-5c42-8dd8-8e13e6bad184", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::GoogleOAuthProvider]", "stub": "__type__", "target_id": "ec577bc3-ecb3-5446-96ca-3842d9183f2f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::EmailPasswordProviderConfig]", "stub": "__type__", "target_id": "f58a65af-0293-5623-87f9-3e79d77665b7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::WebAuthnProviderConfig]", "stub": "__type__", "target_id": "0e105468-3e50-5c03-881d-4c2446b93ee1", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::MagicLinkProviderConfig]", "stub": "__type__", "target_id": "94669beb-b17f-5923-b1ce-42cdbaba861b", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::UIConfig]", "stub": "__type__", "target_id": "594c2313-d943-51c0-a6bb-d9d367926838", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::WebhookConfig]", "stub": "__type__", "target_id": "e7891c5d-ac77-5e4b-bf98-3585ad63c382", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::AuthConfig]", "stub": "__type__", "target_id": "3e1bc003-0fc3-5ff8-9064-26627924dca5", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is ext::auth::ClientTokenIdentity]", "stub": "__type__", "target_id": "7b736e73-4ce5-5dbe-a4a7-d0b278be5ec8", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is Entry]", "stub": "__type__", "target_id": "80e136a6-f70a-11ef-b675-37ad4fedecc7", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is User]", "stub": "__type__", "target_id": "80e32bd5-f70a-11ef-94d7-43ff6af0567f", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is Invitation]", "stub": "__type__", "target_id": "80e6e04a-f70a-11ef-be78-e1dc35b13d52", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<__type__[is Currency]", "stub": "__type__", "target_id": "8a26e1fc-f70a-11ef-8721-ddb397e10907", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<__type__", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<intersection_of", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<subject", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<target", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<union_of", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e37bd85e-5e2f-5daa-9dd9-d21d419032be", { "id": "e37bd85e-5e2f-5daa-9dd9-d21d419032be", "name": "schema::Operator", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "800f2df9-dd86-5681-9e3c-b529af481a9d" }, { "id": "ed8e20ca-f2dc-5626-bccb-05ef9ed65791" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "operator_kind", "target_id": "e48403f0-7017-5bf5-ab92-22825d9f1090", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "is_abstract", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "abstract", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": true, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e48403f0-7017-5bf5-ab92-22825d9f1090", { "id": "e48403f0-7017-5bf5-ab92-22825d9f1090", "name": "schema::OperatorKind", "is_abstract": false, "kind": "scalar", "enum_values": ["Infix", "Postfix", "Prefix", "Ternary"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("87f7d583-3e3c-507e-9fbb-4bf3b9e5aa24", { "id": "87f7d583-3e3c-507e-9fbb-4bf3b9e5aa24", "name": "schema::Parameter", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "typemod", "target_id": "67722d75-1145-54b6-af26-94602de09d51", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "kind", "target_id": "8037d84a-de95-5e63-ab76-727112419261", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "num", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "default", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<params[is schema::CallableObject]", "stub": "params", "target_id": "800f2df9-dd86-5681-9e3c-b529af481a9d", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<params[is schema::Index]", "stub": "params", "target_id": "decfa7fb-1f66-5986-be86-fc9b6c268a97", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<params[is schema::Function]", "stub": "params", "target_id": "3a60f555-7c03-5287-b4c9-f078692a89ef", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<params[is schema::Operator]", "stub": "params", "target_id": "e37bd85e-5e2f-5daa-9dd9-d21d419032be", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<params[is schema::Constraint]", "stub": "params", "target_id": "9346c403-6ee6-50b6-81b2-a35551cfab2f", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<params", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8037d84a-de95-5e63-ab76-727112419261", { "id": "8037d84a-de95-5e63-ab76-727112419261", "name": "schema::ParameterKind", "is_abstract": false, "kind": "scalar", "enum_values": ["VariadicParam", "NamedOnlyParam", "PositionalParam"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", { "id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "name": "schema::Property", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [{ "card": "Many", "name": "<properties[is schema::Link]", "stub": "properties", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }, { "card": "Many", "name": "<properties[is schema::ObjectType]", "stub": "properties", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<properties", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("0875f8c3-7033-5cc4-af04-2b6d80e289e0", { "id": "0875f8c3-7033-5cc4-af04-2b6d80e289e0", "name": "schema::PseudoType", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "8e652319-e551-5b5c-a7bd-9591f0ef5303" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("cced31f8-8167-59d7-b269-c49ae88a0ac1", { "id": "cced31f8-8167-59d7-b269-c49ae88a0ac1", "name": "schema::Range", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "e3a7ccf7-4a20-5151-80b3-5156c9373889" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "element_type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("bc63491c-2a88-5353-b5f0-6f2188a4f65d", { "id": "bc63491c-2a88-5353-b5f0-6f2188a4f65d", "name": "schema::RangeExprAlias", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "cced31f8-8167-59d7-b269-c49ae88a0ac1" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d60198c8-ad58-5c4c-b3b6-d520c19f5cef", { "id": "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", "name": "schema::Rewrite", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "kind", "target_id": "3c6fa29f-8481-59c9-a9bf-ac30ab50be32", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "subject", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<rewrites[is schema::Pointer]", "stub": "rewrites", "target_id": "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<rewrites[is schema::Property]", "stub": "rewrites", "target_id": "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<rewrites[is schema::Link]", "stub": "rewrites", "target_id": "98fe77cc-128e-58fe-b87a-1251c3288548", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<rewrites", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a06f04aa-88b7-5d9a-b520-b8139fd64d0c", { "id": "a06f04aa-88b7-5d9a-b520-b8139fd64d0c", "name": "schema::RewriteKind", "is_abstract": false, "kind": "scalar", "enum_values": ["Update", "Insert"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", { "id": "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", "name": "schema::ScalarType", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "da26fa09-3541-5cba-b93f-d5ba58d25589" }, { "id": "883ec593-7428-5707-af16-d446e5d8ed28" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "default", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "enum_values", "target_id": "bb221d39-09f1-507e-8851-62075bb61823", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "arg_values", "target_id": "bb221d39-09f1-507e-8851-62075bb61823", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("1c938388-8739-57a7-8095-cc173226ad8e", { "id": "1c938388-8739-57a7-8095-cc173226ad8e", "name": "schema::SourceDeleteAction", "is_abstract": false, "kind": "scalar", "enum_values": ["DeleteTarget", "Allow", "DeleteTargetIfOrphan"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("6b925c92-5e48-5e6d-96f2-4125d9119b66", { "id": "6b925c92-5e48-5e6d-96f2-4125d9119b66", "name": "schema::TargetDeleteAction", "is_abstract": false, "kind": "scalar", "enum_values": ["Restrict", "DeleteSource", "Allow", "DeferredRestrict"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2b738231-1ef7-59d0-a04c-dae012181a02", { "id": "2b738231-1ef7-59d0-a04c-dae012181a02", "name": "schema::Trigger", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "timing", "target_id": "a2c7e6ae-370c-53a7-842c-21e238faf3ee", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "kinds", "target_id": "3c6fa29f-8481-59c9-a9bf-ac30ab50be32", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "scope", "target_id": "20998fe7-4392-5673-96b5-5f1cd736b5df", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "expr", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "condition", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "subject", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<triggers[is schema::ObjectType]", "stub": "triggers", "target_id": "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<triggers", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("3c6fa29f-8481-59c9-a9bf-ac30ab50be32", { "id": "3c6fa29f-8481-59c9-a9bf-ac30ab50be32", "name": "schema::TriggerKind", "is_abstract": false, "kind": "scalar", "enum_values": ["Update", "Delete", "Insert"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("20998fe7-4392-5673-96b5-5f1cd736b5df", { "id": "20998fe7-4392-5673-96b5-5f1cd736b5df", "name": "schema::TriggerScope", "is_abstract": false, "kind": "scalar", "enum_values": ["All", "Each"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("a2c7e6ae-370c-53a7-842c-21e238faf3ee", { "id": "a2c7e6ae-370c-53a7-842c-21e238faf3ee", "name": "schema::TriggerTiming", "is_abstract": false, "kind": "scalar", "enum_values": ["After", "AfterCommitOf"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("d88b4a0c-9561-56f4-b0a9-7b24027b4de8", { "id": "d88b4a0c-9561-56f4-b0a9-7b24027b4de8", "name": "schema::Tuple", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "e3a7ccf7-4a20-5151-80b3-5156c9373889" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "named", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "element_types", "target_id": "9cc04b0b-11e0-5670-a8a1-441a323e12fb", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@index", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_computed": false, "is_readonly": false }] }], "exclusives": [{ "element_types": { "card": "Many", "name": "element_types", "target_id": "9cc04b0b-11e0-5670-a8a1-441a323e12fb", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [{ "card": "AtMostOne", "name": "@index", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_computed": false, "is_readonly": false }] } }], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("9cc04b0b-11e0-5670-a8a1-441a323e12fb", { "id": "9cc04b0b-11e0-5670-a8a1-441a323e12fb", "name": "schema::TupleElement", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "type", "target_id": "8e652319-e551-5b5c-a7bd-9591f0ef5303", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<element_types[is schema::Tuple]", "stub": "element_types", "target_id": "d88b4a0c-9561-56f4-b0a9-7b24027b4de8", "kind": "link", "is_exclusive": false }, { "card": "AtMostOne", "name": "<element_types[is schema::TupleExprAlias]", "stub": "element_types", "target_id": "b7744aa3-50fc-54e0-ae51-20d78737e25b", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<element_types", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("b7744aa3-50fc-54e0-ae51-20d78737e25b", { "id": "b7744aa3-50fc-54e0-ae51-20d78737e25b", "name": "schema::TupleExprAlias", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "d88b4a0c-9561-56f4-b0a9-7b24027b4de8" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("67722d75-1145-54b6-af26-94602de09d51", { "id": "67722d75-1145-54b6-af26-94602de09d51", "name": "schema::TypeModifier", "is_abstract": false, "kind": "scalar", "enum_values": ["SetOfType", "OptionalType", "SingletonType"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("de5b90f2-6e49-5543-991b-28a156c7867f", { "id": "de5b90f2-6e49-5543-991b-28a156c7867f", "name": "schema::Volatility", "is_abstract": false, "kind": "scalar", "enum_values": ["Immutable", "Stable", "Volatile", "Modifying"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e4a1d11b-227e-5744-a0c9-31f9cd756e7b", { "id": "e4a1d11b-227e-5744-a0c9-31f9cd756e7b", "name": "std::Endian", "is_abstract": false, "kind": "scalar", "enum_values": ["Little", "Big"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("3b741934-07ef-5b95-b7d6-cdc864fd2ae8", { "id": "3b741934-07ef-5b95-b7d6-cdc864fd2ae8", "name": "std::FreeObject", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("584feb89-c83d-561d-aa78-24e6d779f044", { "id": "584feb89-c83d-561d-aa78-24e6d779f044", "name": "std::JsonEmpty", "is_abstract": false, "kind": "scalar", "enum_values": ["ReturnEmpty", "ReturnTarget", "Error", "UseNull", "DeleteKey"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("581b0325-a044-58d4-aa37-3a85ea671313", { "id": "581b0325-a044-58d4-aa37-3a85ea671313", "name": "std::anypoint", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("1e91671c-8df3-5a76-b695-ccbbb042699a", { "id": "1e91671c-8df3-5a76-b695-ccbbb042699a", "name": "std::anycontiguous", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "581b0325-a044-58d4-aa37-3a85ea671313" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("c11411fe-17a4-525e-a945-3cb0f04560d2", { "id": "c11411fe-17a4-525e-a945-3cb0f04560d2", "name": "std::anydiscrete", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "581b0325-a044-58d4-aa37-3a85ea671313" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("04976545-1176-5536-8673-c9f7d18d581b", { "id": "04976545-1176-5536-8673-c9f7d18d581b", "name": "std::anyreal", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("7076fd20-e25d-5be1-b3c8-4ffc5880a569", { "id": "7076fd20-e25d-5be1-b3c8-4ffc5880a569", "name": "std::anyfloat", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "04976545-1176-5536-8673-c9f7d18d581b" }, { "id": "1e91671c-8df3-5a76-b695-ccbbb042699a" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("15315dad-c4ad-5335-97d6-4612e66ffb71", { "id": "15315dad-c4ad-5335-97d6-4612e66ffb71", "name": "std::anyint", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "04976545-1176-5536-8673-c9f7d18d581b" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("35bd1852-71d7-5f59-8c6c-76f6c0687532", { "id": "35bd1852-71d7-5f59-8c6c-76f6c0687532", "name": "std::anynumeric", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "04976545-1176-5536-8673-c9f7d18d581b" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000110", { "id": "00000000-0000-0000-0000-000000000110", "name": "std::bigint", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "35bd1852-71d7-5f59-8c6c-76f6c0687532" }, { "id": "15315dad-c4ad-5335-97d6-4612e66ffb71" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000109", { "id": "00000000-0000-0000-0000-000000000109", "name": "std::bool", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000102", { "id": "00000000-0000-0000-0000-000000000102", "name": "std::bytes", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000112", { "id": "00000000-0000-0000-0000-000000000112", "name": "std::cal::date_duration", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-00000000010c", { "id": "00000000-0000-0000-0000-00000000010c", "name": "std::cal::local_date", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "c11411fe-17a4-525e-a945-3cb0f04560d2" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-00000000010b", { "id": "00000000-0000-0000-0000-00000000010b", "name": "std::cal::local_datetime", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "1e91671c-8df3-5a76-b695-ccbbb042699a" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-00000000010d", { "id": "00000000-0000-0000-0000-00000000010d", "name": "std::cal::local_time", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000111", { "id": "00000000-0000-0000-0000-000000000111", "name": "std::cal::relative_duration", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-00000000010a", { "id": "00000000-0000-0000-0000-00000000010a", "name": "std::datetime", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "1e91671c-8df3-5a76-b695-ccbbb042699a" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000108", { "id": "00000000-0000-0000-0000-000000000108", "name": "std::decimal", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "35bd1852-71d7-5f59-8c6c-76f6c0687532" }, { "id": "1e91671c-8df3-5a76-b695-ccbbb042699a" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-00000000010e", { "id": "00000000-0000-0000-0000-00000000010e", "name": "std::duration", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "1e91671c-8df3-5a76-b695-ccbbb042699a" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("5ca96424-93ba-560a-994b-7820c9623e3d", { "id": "5ca96424-93ba-560a-994b-7820c9623e3d", "name": "std::enc::Base64Alphabet", "is_abstract": false, "kind": "scalar", "enum_values": ["standard", "urlsafe"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000106", { "id": "00000000-0000-0000-0000-000000000106", "name": "std::float32", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "7076fd20-e25d-5be1-b3c8-4ffc5880a569" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null, "cast_type": "00000000-0000-0000-0000-0000000001ff" });
spec.set("00000000-0000-0000-0000-000000000107", { "id": "00000000-0000-0000-0000-000000000107", "name": "std::float64", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "7076fd20-e25d-5be1-b3c8-4ffc5880a569" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null, "cast_type": "00000000-0000-0000-0000-0000000001ff" });
spec.set("de04eafc-46d5-5037-aae6-52774a4cf421", { "id": "de04eafc-46d5-5037-aae6-52774a4cf421", "name": "std::fts::ElasticLanguage", "is_abstract": false, "kind": "scalar", "enum_values": ["ara", "bul", "cat", "ces", "ckb", "dan", "deu", "ell", "eng", "eus", "fas", "fin", "fra", "gle", "glg", "hin", "hun", "hye", "ind", "ita", "lav", "nld", "nor", "por", "ron", "rus", "spa", "swe", "tha", "tur", "zho", "edb_Brazilian", "edb_ChineseJapaneseKorean"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("efb3a506-d101-5c65-b845-abf56604c8e3", { "id": "efb3a506-d101-5c65-b845-abf56604c8e3", "name": "std::fts::Language", "is_abstract": false, "kind": "scalar", "enum_values": ["ara", "hye", "eus", "cat", "dan", "nld", "eng", "fin", "fra", "deu", "ell", "hin", "hun", "ind", "gle", "ita", "nor", "por", "ron", "rus", "spa", "swe", "tur"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("17c3aca3-4464-5257-bc9f-591fb7bf704c", { "id": "17c3aca3-4464-5257-bc9f-591fb7bf704c", "name": "std::fts::LuceneLanguage", "is_abstract": false, "kind": "scalar", "enum_values": ["ara", "ben", "bul", "cat", "ces", "ckb", "dan", "deu", "ell", "eng", "est", "eus", "fas", "fin", "fra", "gle", "glg", "hin", "hun", "hye", "ind", "ita", "lav", "lit", "nld", "nor", "por", "ron", "rus", "spa", "srp", "swe", "tha", "tur", "edb_Brazilian", "edb_ChineseJapaneseKorean", "edb_Indian"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("f613baf6-1ed8-557e-8f68-e91a0d39e65d", { "id": "f613baf6-1ed8-557e-8f68-e91a0d39e65d", "name": "std::fts::PGLanguage", "is_abstract": false, "kind": "scalar", "enum_values": ["xxx_simple", "ara", "hye", "eus", "cat", "dan", "nld", "eng", "fin", "fra", "deu", "ell", "hin", "hun", "ind", "gle", "ita", "lit", "npi", "nor", "por", "ron", "rus", "srp", "spa", "swe", "tam", "tur", "yid"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("cb579c2d-cc54-54e6-9636-fff6c1643771", { "id": "cb579c2d-cc54-54e6-9636-fff6c1643771", "name": "std::fts::Weight", "is_abstract": false, "kind": "scalar", "enum_values": ["A", "B", "C", "D"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("1d63520b-60fc-5ffe-a70c-ebdb1b3887c2", { "id": "1d63520b-60fc-5ffe-a70c-ebdb1b3887c2", "name": "std::fts::document", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000103", { "id": "00000000-0000-0000-0000-000000000103", "name": "std::int16", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "15315dad-c4ad-5335-97d6-4612e66ffb71" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null, "cast_type": "00000000-0000-0000-0000-0000000001ff" });
spec.set("00000000-0000-0000-0000-000000000104", { "id": "00000000-0000-0000-0000-000000000104", "name": "std::int32", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "15315dad-c4ad-5335-97d6-4612e66ffb71" }, { "id": "c11411fe-17a4-525e-a945-3cb0f04560d2" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null, "cast_type": "00000000-0000-0000-0000-0000000001ff" });
spec.set("00000000-0000-0000-0000-000000000105", { "id": "00000000-0000-0000-0000-000000000105", "name": "std::int64", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "15315dad-c4ad-5335-97d6-4612e66ffb71" }, { "id": "c11411fe-17a4-525e-a945-3cb0f04560d2" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null, "cast_type": "00000000-0000-0000-0000-0000000001ff" });
spec.set("00000000-0000-0000-0000-00000000010f", { "id": "00000000-0000-0000-0000-00000000010f", "name": "std::json", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8b93ef2e-2ddd-5ba2-9333-2e28a4d56ede", { "id": "8b93ef2e-2ddd-5ba2-9333-2e28a4d56ede", "name": "std::net::RequestFailureKind", "is_abstract": false, "kind": "scalar", "enum_values": ["NetworkError", "Timeout"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("5b46c56e-937c-59d2-b3e6-99c31c7c60f0", { "id": "5b46c56e-937c-59d2-b3e6-99c31c7c60f0", "name": "std::net::RequestState", "is_abstract": false, "kind": "scalar", "enum_values": ["Pending", "InProgress", "Completed", "Failed"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("8896d50c-81c2-5d7d-bb2f-cb2bfba3c628", { "id": "8896d50c-81c2-5d7d-bb2f-cb2bfba3c628", "name": "std::net::http::Method", "is_abstract": false, "kind": "scalar", "enum_values": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("6f217eab-7720-5bbc-8b1f-b02098bc9a4e", { "id": "6f217eab-7720-5bbc-8b1f-b02098bc9a4e", "name": "std::net::http::Response", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "created_at", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "status", "target_id": "00000000-0000-0000-0000-000000000103", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "headers", "target_id": "29b1b6f1-a0e0-577d-adcf-e493f6b2303a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "body", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "request", "target_id": "e6bf05a7-60c7-51dd-b30d-c8fce5bcadfd", "kind": "link", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<response[is std::net::http::ScheduledRequest]", "stub": "response", "target_id": "e6bf05a7-60c7-51dd-b30d-c8fce5bcadfd", "kind": "link", "is_exclusive": true }], "backlink_stubs": [{ "card": "Many", "name": "<response", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e6bf05a7-60c7-51dd-b30d-c8fce5bcadfd", { "id": "e6bf05a7-60c7-51dd-b30d-c8fce5bcadfd", "name": "std::net::http::ScheduledRequest", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "state", "target_id": "5b46c56e-937c-59d2-b3e6-99c31c7c60f0", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "created_at", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "updated_at", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "failure", "target_id": "8518df81-575b-5e32-a70c-150c11a199cd", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "url", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "method", "target_id": "8896d50c-81c2-5d7d-bb2f-cb2bfba3c628", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "headers", "target_id": "29b1b6f1-a0e0-577d-adcf-e493f6b2303a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "body", "target_id": "00000000-0000-0000-0000-000000000102", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "response", "target_id": "6f217eab-7720-5bbc-8b1f-b02098bc9a4e", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "response": { "card": "AtMostOne", "name": "response", "target_id": "6f217eab-7720-5bbc-8b1f-b02098bc9a4e", "kind": "link", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<request[is std::net::http::Response]", "stub": "request", "target_id": "6f217eab-7720-5bbc-8b1f-b02098bc9a4e", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<request", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000001000004", { "id": "00000000-0000-0000-0000-000001000004", "name": "std::pg::date", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "c11411fe-17a4-525e-a945-3cb0f04560d2" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000001000005", { "id": "00000000-0000-0000-0000-000001000005", "name": "std::pg::interval", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "1e91671c-8df3-5a76-b695-ccbbb042699a" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000001000001", { "id": "00000000-0000-0000-0000-000001000001", "name": "std::pg::json", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000001000003", { "id": "00000000-0000-0000-0000-000001000003", "name": "std::pg::timestamp", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "1e91671c-8df3-5a76-b695-ccbbb042699a" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000001000002", { "id": "00000000-0000-0000-0000-000001000002", "name": "std::pg::timestamptz", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "1e91671c-8df3-5a76-b695-ccbbb042699a" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("fd1c52ea-74a9-541b-88e2-378d1edb02fd", { "id": "fd1c52ea-74a9-541b-88e2-378d1edb02fd", "name": "std::sequence", "is_abstract": true, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": "00000000-0000-0000-0000-000000000105", "bases": [{ "id": "00000000-0000-0000-0000-000000000105" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000101", { "id": "00000000-0000-0000-0000-000000000101", "name": "std::str", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-000000000100", { "id": "00000000-0000-0000-0000-000000000100", "name": "std::uuid", "is_abstract": false, "kind": "scalar", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "a64cb492-91a2-5ee0-890a-6caeb3e32aa5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("43f8d5e9-5b2e-535b-a46b-acf8af101718", { "id": "43f8d5e9-5b2e-535b-a46b-acf8af101718", "name": "sys::SystemObject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "32faaa35-9475-53cf-88fc-e68ecf1be4d9" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e3838826-d523-59f9-86f4-be3cecdf0d4f", { "id": "e3838826-d523-59f9-86f4-be3cecdf0d4f", "name": "sys::ExternalObject", "is_abstract": true, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "43f8d5e9-5b2e-535b-a46b-acf8af101718" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2572fefc-1810-5379-bc6e-af9b8cf3943b", { "id": "2572fefc-1810-5379-bc6e-af9b8cf3943b", "name": "sys::Branch", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "e3838826-d523-59f9-86f4-be3cecdf0d4f" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "last_migration", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<branch[is sys::QueryStats]", "stub": "branch", "target_id": "ce92490c-1d17-5950-8bdd-cf9e23817551", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<branch", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("fd469647-1cf1-5702-85b6-bbdb7e7f1c7e", { "id": "fd469647-1cf1-5702-85b6-bbdb7e7f1c7e", "name": "sys::Database", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "2572fefc-1810-5379-bc6e-af9b8cf3943b" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("87787989-1e54-5529-9cc4-524cc873528d", { "id": "87787989-1e54-5529-9cc4-524cc873528d", "name": "sys::ExtensionPackage", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "43f8d5e9-5b2e-535b-a46b-acf8af101718" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "script", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "version", "target_id": "48a4615d-2402-5744-bd11-17015ad18bb9", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [{ "card": "AtMostOne", "name": "<package[is schema::Extension]", "stub": "package", "target_id": "b9c53751-8d28-5077-b1db-a03ea59557ed", "kind": "link", "is_exclusive": true }], "backlink_stubs": [{ "card": "Many", "name": "<package", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("e3aaabec-f88b-5fe0-b06e-cea0b3d46fa8", { "id": "e3aaabec-f88b-5fe0-b06e-cea0b3d46fa8", "name": "sys::ExtensionPackageMigration", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "43f8d5e9-5b2e-535b-a46b-acf8af101718" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "script", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "from_version", "target_id": "48a4615d-2402-5744-bd11-17015ad18bb9", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "to_version", "target_id": "48a4615d-2402-5744-bd11-17015ad18bb9", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("cae65a8c-a99f-5524-9872-daecdc545531", { "id": "cae65a8c-a99f-5524-9872-daecdc545531", "name": "sys::OutputFormat", "is_abstract": false, "kind": "scalar", "enum_values": ["BINARY", "JSON", "JSON_ELEMENTS", "NONE"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("ce92490c-1d17-5950-8bdd-cf9e23817551", { "id": "ce92490c-1d17-5950-8bdd-cf9e23817551", "name": "sys::QueryStats", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "e3838826-d523-59f9-86f4-be3cecdf0d4f" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "AtMostOne", "name": "query", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "query_type", "target_id": "f2887f6f-bd51-5422-8ac7-d1732fdcd17d", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "tag", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "compilation_config", "target_id": "00000000-0000-0000-0000-00000000010f", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "protocol_version", "target_id": "2b6d1efa-c38a-5c12-ad0e-535e393979ba", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "default_namespace", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "namespace_aliases", "target_id": "00000000-0000-0000-0000-00000000010f", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "output_format", "target_id": "cae65a8c-a99f-5524-9872-daecdc545531", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "expect_one", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "implicit_limit", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "inline_typeids", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "inline_typenames", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "inline_objectids", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "plans", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "total_plan_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "min_plan_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "max_plan_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "mean_plan_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "stddev_plan_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "calls", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "total_exec_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "min_exec_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "max_exec_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "mean_exec_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "stddev_exec_time", "target_id": "00000000-0000-0000-0000-00000000010e", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "rows", "target_id": "00000000-0000-0000-0000-000000000105", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "stats_since", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "minmax_stats_since", "target_id": "00000000-0000-0000-0000-00000000010a", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "branch", "target_id": "2572fefc-1810-5379-bc6e-af9b8cf3943b", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("f2887f6f-bd51-5422-8ac7-d1732fdcd17d", { "id": "f2887f6f-bd51-5422-8ac7-d1732fdcd17d", "name": "sys::QueryType", "is_abstract": false, "kind": "scalar", "enum_values": ["EdgeQL", "SQL"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("04d3804d-c37f-5969-86b2-a24309653b14", { "id": "04d3804d-c37f-5969-86b2-a24309653b14", "name": "sys::Role", "is_abstract": false, "kind": "object", "enum_values": null, "is_seq": false, "material_id": null, "bases": [{ "id": "43f8d5e9-5b2e-535b-a46b-acf8af101718" }, { "id": "825a1378-6b30-5f15-82f1-1c92e57691f2" }, { "id": "970b2d83-85d8-5a46-a4e8-337d28abc12e" }], "union_of": [], "intersection_of": [], "pointers": [{ "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "superuser", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "One", "name": "is_superuser", "target_id": "00000000-0000-0000-0000-000000000109", "kind": "property", "is_exclusive": false, "is_computed": true, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "AtMostOne", "name": "password", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }, { "card": "Many", "name": "member_of", "target_id": "04d3804d-c37f-5969-86b2-a24309653b14", "kind": "link", "is_exclusive": false, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] }], "exclusives": [{ "name": { "card": "One", "name": "name", "target_id": "00000000-0000-0000-0000-000000000101", "kind": "property", "is_exclusive": true, "is_computed": false, "is_readonly": false, "has_default": false, "pointers": [] } }], "backlinks": [{ "card": "Many", "name": "<member_of[is sys::Role]", "stub": "member_of", "target_id": "04d3804d-c37f-5969-86b2-a24309653b14", "kind": "link", "is_exclusive": false }], "backlink_stubs": [{ "card": "Many", "name": "<member_of", "target_id": "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", "kind": "link", "is_exclusive": false }], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("775fc501-0b35-57fa-8587-cd7c53557cdf", { "id": "775fc501-0b35-57fa-8587-cd7c53557cdf", "name": "sys::TransactionAccessMode", "is_abstract": false, "kind": "scalar", "enum_values": ["ReadOnly", "ReadWrite"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("2eb021ec-461e-5b65-859c-26c1eee234a1", { "id": "2eb021ec-461e-5b65-859c-26c1eee234a1", "name": "sys::TransactionDeferrability", "is_abstract": false, "kind": "scalar", "enum_values": ["Deferrable", "NotDeferrable"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("070715f3-0100-5580-9473-696f961243eb", { "id": "070715f3-0100-5580-9473-696f961243eb", "name": "sys::TransactionIsolation", "is_abstract": false, "kind": "scalar", "enum_values": ["RepeatableRead", "Serializable"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("16a08f13-b1b1-57f4-8e82-062f67fb2a4c", { "id": "16a08f13-b1b1-57f4-8e82-062f67fb2a4c", "name": "sys::VersionStage", "is_abstract": false, "kind": "scalar", "enum_values": ["dev", "alpha", "beta", "rc", "final"], "is_seq": false, "material_id": null, "bases": [{ "id": "48896eaf-b8af-5f80-9073-0884475d6ee5" }], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [], "range_element_id": null, "multirange_element_id": null });
spec.set("7bfb0106-9442-58d3-9fe3-3c204e331351", { "id": "7bfb0106-9442-58d3-9fe3-3c204e331351", "name": "tuple<header:std::str, payload:std::str, signature:std::str>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000101", "name": "header" }, { "target_id": "00000000-0000-0000-0000-000000000101", "name": "payload" }, { "target_id": "00000000-0000-0000-0000-000000000101", "name": "signature" }], "range_element_id": null, "multirange_element_id": null });
spec.set("8518df81-575b-5e32-a70c-150c11a199cd", { "id": "8518df81-575b-5e32-a70c-150c11a199cd", "name": "tuple<kind:std::net::RequestFailureKind, message:std::str>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "8b93ef2e-2ddd-5ba2-9333-2e28a4d56ede", "name": "kind" }, { "target_id": "00000000-0000-0000-0000-000000000101", "name": "message" }], "range_element_id": null, "multirange_element_id": null });
spec.set("2b6d1efa-c38a-5c12-ad0e-535e393979ba", { "id": "2b6d1efa-c38a-5c12-ad0e-535e393979ba", "name": "tuple<major:std::int16, minor:std::int16>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000103", "name": "major" }, { "target_id": "00000000-0000-0000-0000-000000000103", "name": "minor" }], "range_element_id": null, "multirange_element_id": null });
spec.set("2e1efa8d-b194-5b38-ad67-93b27aec520c", { "id": "2e1efa8d-b194-5b38-ad67-93b27aec520c", "name": "tuple<major:std::int64, minor:std::int64, stage:std::str, stage_no:std::int64, local:array<std|str>>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000105", "name": "major" }, { "target_id": "00000000-0000-0000-0000-000000000105", "name": "minor" }, { "target_id": "00000000-0000-0000-0000-000000000101", "name": "stage" }, { "target_id": "00000000-0000-0000-0000-000000000105", "name": "stage_no" }, { "target_id": "bb221d39-09f1-507e-8851-62075bb61823", "name": "local" }], "range_element_id": null, "multirange_element_id": null });
spec.set("48a4615d-2402-5744-bd11-17015ad18bb9", { "id": "48a4615d-2402-5744-bd11-17015ad18bb9", "name": "tuple<major:std::int64, minor:std::int64, stage:sys::VersionStage, stage_no:std::int64, local:array<std|str>>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000105", "name": "major" }, { "target_id": "00000000-0000-0000-0000-000000000105", "name": "minor" }, { "target_id": "16a08f13-b1b1-57f4-8e82-062f67fb2a4c", "name": "stage" }, { "target_id": "00000000-0000-0000-0000-000000000105", "name": "stage_no" }, { "target_id": "bb221d39-09f1-507e-8851-62075bb61823", "name": "local" }], "range_element_id": null, "multirange_element_id": null });
spec.set("f5e31516-7567-519d-847f-397a0762ce23", { "id": "f5e31516-7567-519d-847f-397a0762ce23", "name": "tuple<name:std::str, expr:std::str>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000101", "name": "name" }, { "target_id": "00000000-0000-0000-0000-000000000101", "name": "expr" }], "range_element_id": null, "multirange_element_id": null });
spec.set("27d815f4-6518-598a-a3c5-9364342d6e06", { "id": "27d815f4-6518-598a-a3c5-9364342d6e06", "name": "tuple<name:std::str, expr:tuple<text:std|str, refs:array<std||uuid>>>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000101", "name": "name" }, { "target_id": "67996f7a-c82f-5b58-bb0a-f29764ee45c2", "name": "expr" }], "range_element_id": null, "multirange_element_id": null });
spec.set("08ede6a9-78ab-555f-944a-fca75d31eb5a", { "id": "08ede6a9-78ab-555f-944a-fca75d31eb5a", "name": "tuple<name:std::str, value:std::str>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000101", "name": "name" }, { "target_id": "00000000-0000-0000-0000-000000000101", "name": "value" }], "range_element_id": null, "multirange_element_id": null });
spec.set("c13eb6f1-a05c-533f-bfe8-a50b1a077fd0", { "id": "c13eb6f1-a05c-533f-bfe8-a50b1a077fd0", "name": "tuple<object:anyobject, score:std::float32>", "is_abstract": true, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000003", "name": "object" }, { "target_id": "00000000-0000-0000-0000-000000000106", "name": "score" }], "range_element_id": null, "multirange_element_id": null });
spec.set("e34cf562-ee0c-58d3-a1ee-ff9fbb35bfc3", { "id": "e34cf562-ee0c-58d3-a1ee-ff9fbb35bfc3", "name": "tuple<std::int64, anytype>", "is_abstract": true, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000105", "name": "0" }, { "target_id": "00000000-0000-0000-0000-000000000001", "name": "1" }], "range_element_id": null, "multirange_element_id": null });
spec.set("b20a2c38-2942-5085-88a3-1bbb1eea755f", { "id": "b20a2c38-2942-5085-88a3-1bbb1eea755f", "name": "tuple<std::int64, std::int64>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000105", "name": "0" }, { "target_id": "00000000-0000-0000-0000-000000000105", "name": "1" }], "range_element_id": null, "multirange_element_id": null });
spec.set("416fe1a6-d62c-5481-80cd-2102a37b3415", { "id": "416fe1a6-d62c-5481-80cd-2102a37b3415", "name": "tuple<std::str, std::json>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000101", "name": "0" }, { "target_id": "00000000-0000-0000-0000-00000000010f", "name": "1" }], "range_element_id": null, "multirange_element_id": null });
spec.set("67996f7a-c82f-5b58-bb0a-f29764ee45c2", { "id": "67996f7a-c82f-5b58-bb0a-f29764ee45c2", "name": "tuple<text:std::str, refs:array<std|uuid>>", "is_abstract": false, "kind": "tuple", "enum_values": null, "is_seq": false, "material_id": null, "bases": [], "union_of": [], "intersection_of": [], "pointers": [], "exclusives": [], "backlinks": [], "backlink_stubs": [], "array_element_id": null, "tuple_elements": [{ "target_id": "00000000-0000-0000-0000-000000000101", "name": "text" }, { "target_id": "1378c9c3-b11a-5a95-bdac-066a4143094d", "name": "refs" }], "range_element_id": null, "multirange_element_id": null });
spec.set("00000000-0000-0000-0000-0000000001ff", { "id": "00000000-0000-0000-0000-0000000001ff", "name": "std::number", "is_abstract": false, "is_seq": false, "kind": "scalar", "enum_values": null, "material_id": null, "bases": [] });
const complexParamKinds = /* @__PURE__ */ new Set([]);
const ASC = "ASC";
const DESC = "DESC";
const EMPTY_FIRST = "EMPTY FIRST";
const EMPTY_LAST = "EMPTY LAST";
function is(expr, shape) {
  const mappedShape = {};
  for (const [key, value] of Object.entries(shape)) {
    if (key === "id") continue;
    mappedShape[key] = {
      __kind__: ExpressionKind.PolyShapeElement,
      __polyType__: expr,
      __shapeElement__: value
    };
  }
  return mappedShape;
}
function $handleModifiers(modifiers, params2) {
  const { root, scope } = params2;
  const mods = {
    singleton: !!modifiers["filter_single"]
  };
  let card = root.__cardinality__;
  let needsAssertSingle = false;
  if (modifiers.filter) {
    mods.filter = modifiers.filter;
  }
  if (modifiers.filter_single) {
    if (root.__element__.__kind__ !== TypeKind.object) {
      throw new Error("filter_single can only be used with object types");
    }
    card = Cardinality$1.AtMostOne;
    const fs = modifiers.filter_single;
    if (fs.__element__) {
      mods.filter = modifiers.filter_single;
      needsAssertSingle = true;
    } else {
      const exprs = Object.keys(fs).map((key) => {
        const val = fs[key].__element__ ? fs[key] : literal(
          root.__element__["__pointers__"][key]["target"],
          fs[key]
        );
        return $expressionify({
          __element__: {
            __name__: "std::bool",
            __kind__: TypeKind.scalar
          },
          __cardinality__: Cardinality$1.One,
          __kind__: ExpressionKind.Operator,
          __opkind__: OperatorKind$1.Infix,
          __name__: "=",
          __args__: [scope[key], val]
        });
      });
      if (exprs.length === 1) {
        mods.filter = exprs[0];
      } else {
        mods.filter = exprs.reduce((a, b) => {
          return $expressionify({
            __element__: {
              __name__: "std::bool",
              __kind__: TypeKind.scalar
            },
            __cardinality__: Cardinality$1.One,
            __kind__: ExpressionKind.Operator,
            __opkind__: OperatorKind$1.Infix,
            __name__: "and",
            __args__: [a, b]
          });
        });
      }
    }
  }
  if (modifiers.order_by) {
    const orderExprs = Array.isArray(modifiers.order_by) ? modifiers.order_by : [modifiers.order_by];
    mods.order_by = orderExprs.map(
      (expr) => typeof expr.__element__ === "undefined" ? expr : { expression: expr }
    );
  }
  if (modifiers.offset) {
    mods.offset = typeof modifiers.offset === "number" ? $getTypeByName("std::number")(modifiers.offset) : modifiers.offset;
    card = cardutil.overrideLowerBound(card, "Zero");
  }
  if (modifiers.limit) {
    let expr;
    if (typeof modifiers.limit === "number") {
      expr = $getTypeByName("std::number")(modifiers.limit);
    } else {
      const type = modifiers.limit.__element__.__casttype__ ?? modifiers.limit.__element__;
      if (type.__kind__ === TypeKind.scalar && type.__name__ === "std::number") {
        expr = modifiers.limit;
      } else {
        throw new Error("Invalid value for `limit` modifier");
      }
    }
    mods.limit = expr;
    card = cardutil.overrideLowerBound(card, "Zero");
  }
  return {
    modifiers: mods,
    cardinality: card,
    needsAssertSingle
  };
}
function deleteExpr(expr, modifiersGetter) {
  const selectExpr = select(expr, modifiersGetter);
  return $expressionify({
    __kind__: ExpressionKind.Delete,
    __element__: selectExpr.__element__,
    __cardinality__: selectExpr.__cardinality__,
    __expr__: selectExpr
  });
}
function $selectify(expr) {
  return expr;
}
const $FreeObject$1 = makeType(
  spec,
  [...spec.values()].find((s) => s.name === "std::FreeObject").id,
  literal
);
const FreeObject$1 = {
  __kind__: ExpressionKind.PathNode,
  __element__: $FreeObject$1,
  __cardinality__: Cardinality$1.One,
  __parent__: null,
  __exclusive__: true,
  __scopeRoot__: null
};
const $existingScopes = /* @__PURE__ */ new Set();
function $shape(_a, b) {
  return b;
}
function select(...args) {
  const firstArg = args[0];
  if (typeof firstArg !== "object" || firstArg instanceof Uint8Array || firstArg instanceof Date || firstArg instanceof Duration || firstArg instanceof LocalDateTime || firstArg instanceof LocalDate || firstArg instanceof LocalTime || firstArg instanceof RelativeDuration || firstArg instanceof DateDuration || firstArg instanceof ConfigMemory || firstArg instanceof Float32Array) {
    const literalExpr = literalToTypeSet(firstArg);
    return $expressionify(
      $selectify({
        __kind__: ExpressionKind.Select,
        __element__: literalExpr.__element__,
        __cardinality__: literalExpr.__cardinality__,
        __expr__: literalExpr,
        __modifiers__: {}
      })
    );
  }
  const exprPair = typeof args[0].__element__ !== "undefined" ? args : [FreeObject$1, () => args[0]];
  let expr = exprPair[0];
  const shapeGetter = exprPair[1];
  if (expr === FreeObject$1) {
    const freeObjectPtrs = {};
    for (const [k, v] of Object.entries(args[0])) {
      freeObjectPtrs[k] = {
        __kind__: v.__element__.__kind__ === TypeKind.object ? "link" : "property",
        target: v.__element__,
        cardinality: v.__cardinality__,
        exclusive: false,
        computed: true,
        readonly: true,
        hasDefault: false,
        properties: {}
      };
    }
    expr = {
      ...FreeObject$1,
      __element__: {
        ...FreeObject$1.__element__,
        __pointers__: {
          ...FreeObject$1.__element__.__pointers__,
          ...freeObjectPtrs
        }
      }
    };
  }
  if (!shapeGetter) {
    if (expr.__element__.__kind__ === TypeKind.object) {
      const objectExpr = expr;
      return $expressionify(
        $selectify({
          __kind__: ExpressionKind.Select,
          __element__: {
            __kind__: TypeKind.object,
            __name__: `${objectExpr.__element__.__name__}`,
            // _shape
            __pointers__: objectExpr.__element__.__pointers__,
            __shape__: objectExpr.__element__.__shape__
          },
          __cardinality__: objectExpr.__cardinality__,
          __expr__: objectExpr,
          __modifiers__: {}
        })
      );
    } else {
      return $expressionify(
        $selectify({
          __kind__: ExpressionKind.Select,
          __element__: expr.__element__,
          __cardinality__: expr.__cardinality__,
          __expr__: expr,
          __modifiers__: {}
        })
      );
    }
  }
  const cleanScopedExprs = $existingScopes.size === 0;
  const { modifiers: mods, shape, scope } = resolveShape$1(shapeGetter, expr);
  if (cleanScopedExprs) {
    $existingScopes.clear();
  }
  const { modifiers, cardinality, needsAssertSingle } = $handleModifiers(mods, {
    root: expr,
    scope
  });
  const selectExpr = $selectify({
    __kind__: ExpressionKind.Select,
    __element__: expr.__element__.__kind__ === TypeKind.object ? {
      __kind__: TypeKind.object,
      __name__: `${expr.__element__.__name__}`,
      // _shape
      __pointers__: expr.__element__.__pointers__,
      __shape__: shape
    } : expr.__element__,
    __cardinality__: cardinality,
    __expr__: expr,
    __modifiers__: modifiers,
    __scope__: expr !== scope ? scope : void 0
  });
  return needsAssertSingle ? $assert_single(selectExpr) : $expressionify(selectExpr);
}
function resolveShape$1(shapeGetter, expr) {
  const modifiers = {};
  const shape = {};
  const scope = expr.__element__.__kind__ === TypeKind.object ? $getScopedExpr(expr, $existingScopes) : expr;
  const selectShape = typeof shapeGetter === "function" ? shapeGetter(scope) : shapeGetter;
  for (const [key, value] of Object.entries(selectShape)) {
    if (key === "filter" || key === "filter_single" || key === "order_by" || key === "offset" || key === "limit") {
      modifiers[key] = value;
    } else {
      if (expr.__element__.__kind__ !== TypeKind.object) {
        throw new Error(
          `Invalid select shape key '${key}' on scalar expression, only modifiers are allowed (filter, order_by, offset and limit)`
        );
      }
      shape[key] = resolveShapeElement(key, value, scope);
    }
  }
  return { shape, modifiers, scope };
}
function resolveShapeElement(key, value, scope) {
  const isSubshape = typeof value === "object" && typeof value.__kind__ === "undefined";
  const isClosure = typeof value === "function" && scope.__element__.__pointers__[key]?.__kind__ === "link";
  if (isSubshape || isClosure) {
    const childExpr = scope[key];
    if (!childExpr) {
      throw new Error(
        `Invalid shape element "${key}" for type ${scope.__element__.__name__}`
      );
    }
    const {
      shape: childShape,
      scope: childScope,
      modifiers: mods
    } = resolveShape$1(value, childExpr);
    const { modifiers, needsAssertSingle } = $handleModifiers(mods, {
      root: childExpr,
      scope: childScope
    });
    const selectExpr = {
      __kind__: ExpressionKind.Select,
      __element__: {
        __kind__: TypeKind.object,
        __name__: `${childExpr.__element__.__name__}`,
        __pointers__: childExpr.__element__.__pointers__,
        __shape__: childShape
      },
      __cardinality__: scope.__element__.__pointers__?.[key]?.cardinality || scope.__element__.__shape__?.[key]?.__cardinality__,
      __expr__: childExpr,
      __modifiers__: modifiers,
      __scope__: childExpr !== childScope ? childScope : void 0
    };
    return needsAssertSingle ? $assert_single(selectExpr) : selectExpr;
  } else if (value?.__kind__ === ExpressionKind.PolyShapeElement) {
    const polyElement = value;
    const polyScope = scope.is(polyElement.__polyType__);
    return {
      __kind__: ExpressionKind.PolyShapeElement,
      __polyType__: polyScope,
      __shapeElement__: resolveShapeElement(
        key,
        polyElement.__shapeElement__,
        polyScope
      )
    };
  } else if (typeof value === "boolean" && key.startsWith("@")) {
    const linkProp = scope[key];
    if (!linkProp) {
      throw new Error(
        scope.__parent__ ? `link property '${key}' does not exist on link ${scope.__parent__.linkName}` : `cannot select link property '${key}' on an object (${scope.__element__.__name__})`
      );
    }
    return value ? linkProp : false;
  } else {
    return value;
  }
}
const runnableExpressionKinds = /* @__PURE__ */ new Set([
  ExpressionKind.Select,
  ExpressionKind.Update,
  ExpressionKind.Insert,
  ExpressionKind.InsertUnlessConflict,
  ExpressionKind.Delete,
  ExpressionKind.Group,
  ExpressionKind.For,
  ExpressionKind.With,
  ExpressionKind.WithParams
]);
const wrappedExprCache = /* @__PURE__ */ new WeakMap();
async function $queryFunc(cxn, args) {
  const expr = runnableExpressionKinds.has(this.__kind__) ? this : wrappedExprCache.get(this) ?? wrappedExprCache.set(this, select(this)).get(this);
  const _args = jsonifyComplexParams(expr, args);
  const query = expr.toEdgeQL();
  if (expr.__cardinality__ === Cardinality$1.One || expr.__cardinality__ === Cardinality$1.AtMostOne || expr.__cardinality__ === Cardinality$1.Empty) {
    return cxn.querySingle(query, _args);
  } else {
    return cxn.query(query, _args);
  }
}
async function $queryFuncJSON(cxn, args) {
  const expr = runnableExpressionKinds.has(this.__kind__) ? this : wrappedExprCache.get(this) ?? wrappedExprCache.set(this, select(this)).get(this);
  const _args = jsonifyComplexParams(expr, args);
  if (expr.__cardinality__ === Cardinality$1.One || expr.__cardinality__ === Cardinality$1.AtMostOne) {
    return cxn.querySingleJSON(expr.toEdgeQL(), _args);
  } else {
    return cxn.queryJSON(expr.toEdgeQL(), _args);
  }
}
function PathLeaf(root, parent, _exclusive, scopeRoot = null) {
  return $expressionify({
    __kind__: ExpressionKind.PathLeaf,
    __element__: root.__element__,
    __cardinality__: root.__cardinality__,
    __parent__: parent,
    // __exclusive__: exclusive,
    __scopeRoot__: scopeRoot
  });
}
function getStarShapeFromPointers(pointers) {
  const shape = {};
  for (const [key, ptr] of Object.entries(pointers)) {
    if (ptr.__kind__ === "property") {
      shape[key] = true;
    }
  }
  return shape;
}
function PathNode(root, parent, scopeRoot = null) {
  const obj = {
    __kind__: ExpressionKind.PathNode,
    __element__: root.__element__,
    __cardinality__: root.__cardinality__,
    __parent__: parent,
    // __exclusive__: exclusive,
    __scopeRoot__: scopeRoot
  };
  Object.defineProperty(obj, "*", {
    writable: false,
    value: getStarShapeFromPointers(obj.__element__.__pointers__)
  });
  return $expressionify(obj);
}
const _pathCache = Symbol();
const _pointers = Symbol();
const pathifyProxyHandlers = {
  get(target, prop, proxy) {
    const ptr = target[_pointers][prop];
    if (ptr) {
      return target[_pathCache][prop] ?? (target[_pathCache][prop] = (ptr.__kind__ === "property" ? PathLeaf : PathNode)(
        {
          __element__: ptr.target,
          __cardinality__: cardutil.multiplyCardinalities(
            target.__cardinality__,
            ptr.cardinality
          )
        },
        {
          linkName: prop,
          type: proxy
        },
        ptr.exclusive ?? false,
        target.__scopeRoot__ ?? (scopeRoots.has(proxy) ? proxy : null)
      ));
    }
    return target[prop];
  }
};
function $pathify(_root) {
  if (_root.__element__.__kind__ !== TypeKind.object) {
    return _root;
  }
  const root = _root;
  let pointers = {
    ...root.__element__.__pointers__
  };
  if (root.__parent__) {
    const { type, linkName } = root.__parent__;
    const parentPointer = type.__element__.__pointers__[linkName];
    if (parentPointer?.__kind__ === "link") {
      pointers = { ...pointers, ...parentPointer.properties };
    }
  }
  for (const [key, val] of Object.entries(
    root.__element__.__shape__ || { id: true }
  )) {
    if (pointers[key]) continue;
    const valType = val?.__element__;
    if (!valType) continue;
    pointers[key] = {
      __kind__: valType.__kind__ === TypeKind.object ? "link" : "property",
      properties: {},
      target: val.__element__,
      cardinality: val.__cardinality__,
      exclusive: false,
      computed: true,
      readonly: true,
      hasDefault: false
    };
  }
  root[_pointers] = pointers;
  root[_pathCache] = {};
  return new Proxy(root, pathifyProxyHandlers);
}
function isFunc(expr) {
  return $expressionify({
    __kind__: ExpressionKind.TypeIntersection,
    __cardinality__: this.__cardinality__,
    __element__: {
      ...expr.__element__,
      __shape__: { id: true }
    },
    __expr__: this
  });
}
function $assert_single(expr) {
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: expr.__element__,
    __cardinality__: cardutil.overrideUpperBound(expr.__cardinality__, "One"),
    __name__: "std::assert_single",
    __args__: [expr],
    __namedargs__: {}
  });
}
const jsonDestructureProxyHandlers = {
  get(target, prop, proxy) {
    if (typeof prop === "string" && !(prop in target)) {
      const parsedProp = Number.isInteger(Number(prop)) ? Number(prop) : prop;
      return jsonDestructure.call(proxy, parsedProp);
    }
    return target[prop];
  }
};
function jsonDestructure(path) {
  const pathTypeSet = literalToTypeSet(path);
  return $expressionify({
    __kind__: ExpressionKind.Operator,
    __element__: this.__element__,
    __cardinality__: cardutil.multiplyCardinalities(
      this.__cardinality__,
      pathTypeSet.__cardinality__
    ),
    __name__: "[]",
    __opkind__: "Infix",
    __args__: [this, pathTypeSet]
  });
}
function $jsonDestructure(_expr) {
  if (_expr.__element__.__kind__ === TypeKind.scalar && _expr.__element__.__name__ === "std::json") {
    const expr = new Proxy(_expr, jsonDestructureProxyHandlers);
    expr.destructure = jsonDestructure.bind(expr);
    return expr;
  }
  return _expr;
}
function $expressionify(_expr) {
  const expr = $pathify(
    $jsonDestructure($arrayLikeIndexify($tuplePathify(_expr)))
  );
  expr.run = $queryFunc.bind(expr);
  expr.runJSON = $queryFuncJSON.bind(expr);
  expr.is = isFunc.bind(expr);
  expr.toEdgeQL = $toEdgeQL.bind(expr);
  expr.assert_single = () => $assert_single(expr);
  return Object.freeze(expr);
}
const scopedExprCache = /* @__PURE__ */ new WeakMap();
const scopeRoots = /* @__PURE__ */ new WeakSet();
function $getScopedExpr(expr, existingScopes) {
  let scopedExpr = scopedExprCache.get(expr);
  if (!scopedExpr || existingScopes?.has(scopedExpr)) {
    const isFreeObject = expr.__cardinality__ === Cardinality$1.One && expr.__element__.__name__ === "std::FreeObject";
    scopedExpr = isFreeObject ? expr : $expressionify({
      ...expr,
      __cardinality__: Cardinality$1.One,
      __scopedFrom__: expr,
      ...expr.__element__.__kind__ === TypeKind.object ? {
        "*": getStarShapeFromPointers(
          expr.__element__.__pointers__
        )
      } : {}
    });
    scopeRoots.add(scopedExpr);
    const uncached = !scopedExpr;
    if (uncached) {
      scopedExprCache.set(expr, scopedExpr);
    }
  }
  existingScopes?.add(scopedExpr);
  return scopedExpr;
}
function literal(type, value) {
  return $expressionify({
    __element__: type,
    __cardinality__: Cardinality$1.One,
    __kind__: ExpressionKind.Literal,
    __value__: value
  });
}
const $nameMapping = new Map([
  ...[...spec.values()].map((type) => [type.name, type.id]),
  ["std::number", "00000000-0000-0000-0000-0000000001ff"]
]);
function $getType(id) {
  return makeType(spec, id, literal);
}
function $getTypeByName(name) {
  return makeType(spec, $nameMapping.get(name), literal);
}
function set$1(..._exprs) {
  if (_exprs.length === 0) {
    return null;
  }
  const exprs = _exprs.map((expr) => literalToTypeSet(expr));
  return $expressionify({
    __kind__: ExpressionKind.Set,
    __element__: exprs.map((expr) => expr.__element__).reduce(getSharedParent),
    __cardinality__: cardutil.mergeCardinalitiesVariadic(
      exprs.map((expr) => expr.__cardinality__)
    ),
    __exprs__: exprs
  });
}
function getSharedParent(a, b) {
  if (a.__kind__ !== b.__kind__) {
    throw new Error(
      `Incompatible array types: ${a.__name__} and ${b.__name__}`
    );
  }
  if (a.__kind__ === TypeKind.scalar && b.__kind__ === TypeKind.scalar) {
    return getSharedParentScalar(a, b);
  } else if (a.__kind__ === TypeKind.object && b.__kind__ === TypeKind.object) {
    return $mergeObjectTypes(a, b);
  } else if (a.__kind__ === TypeKind.tuple && b.__kind__ === TypeKind.tuple) {
    if (a.__items__.length !== b.__items__.length) {
      throw new Error(
        `Incompatible tuple types: ${a.__name__} and ${b.__name__}`
      );
    }
    try {
      const items = a.__items__.map((_, i) => {
        if (!a.__items__[i] || !b.__items__[i]) {
          throw new Error();
        }
        return getSharedParent(
          a.__items__[i],
          b.__items__[i]
        );
      });
      return {
        __kind__: TypeKind.tuple,
        __name__: `tuple<${items.map((item) => item.__name__).join(", ")}>`,
        __items__: items
      };
    } catch (_err) {
      throw new Error(
        `Incompatible tuple types: ${a.__name__} and ${b.__name__}`
      );
    }
  } else if (a.__kind__ === TypeKind.namedtuple && b.__kind__ === TypeKind.namedtuple) {
    const aKeys = Object.keys(a);
    const bKeys = new Set(Object.keys(b));
    const sameKeys = aKeys.length === bKeys.size && aKeys.every((k) => bKeys.has(k));
    if (!sameKeys) {
      throw new Error(
        `Incompatible tuple types: ${a.__name__} and ${b.__name__}`
      );
    }
    try {
      const items = {};
      for (const [i] of Object.entries(a.__shape__)) {
        if (!a.__shape__[i] || !b.__shape__[i]) {
          throw new Error();
        }
        items[i] = getSharedParent(
          a.__shape__[i],
          b.__shape__[i]
        );
      }
      return {
        __kind__: TypeKind.namedtuple,
        __name__: `tuple<${Object.entries(items).map(([key, val]) => `${key}: ${val.__name__}`).join(", ")}>`,
        __shape__: items
      };
    } catch (_err) {
      throw new Error(
        `Incompatible tuple types: ${a.__name__} and ${b.__name__}`
      );
    }
  } else if (a.__kind__ === TypeKind.array && b.__kind__ === TypeKind.array) {
    try {
      const mergedEl = getSharedParent(
        a.__element__,
        b.__element__
      );
      return {
        __kind__: TypeKind.array,
        __name__: a.__name__,
        __element__: mergedEl
      };
    } catch (_err) {
      throw new Error(
        `Incompatible array types: ${a.__name__} and ${b.__name__}`
      );
    }
  } else if (a.__kind__ === TypeKind.enum && b.__kind__ === TypeKind.enum) {
    if (a.__name__ === b.__name__) return a;
    throw new Error(
      `Incompatible array types: ${a.__name__} and ${b.__name__}`
    );
  } else {
    throw new Error(
      `Incompatible array types: ${a.__name__} and ${b.__name__}`
    );
  }
}
function cast(target, expr) {
  const cleanedExpr = expr === null ? null : literalToTypeSet(expr);
  return $expressionify({
    __element__: target.__cardinality__ ? target.__element__ : target,
    __cardinality__: cleanedExpr === null ? Cardinality$1.Empty : cleanedExpr.__cardinality__,
    __expr__: cleanedExpr,
    __kind__: ExpressionKind.Cast
  });
}
function unlessConflict(conflictGetter) {
  const expr = {
    __kind__: ExpressionKind.InsertUnlessConflict,
    __element__: this.__element__,
    __cardinality__: Cardinality$1.AtMostOne,
    __expr__: this
    // __conflict__: Conflict;
  };
  if (!conflictGetter) {
    expr.__conflict__ = { on: null };
    return $expressionify(expr);
  } else {
    const scopedExpr = $getScopedExpr(this.__expr__);
    const conflict = conflictGetter(scopedExpr);
    expr.__conflict__ = conflict;
    if (conflict.else) {
      expr.__cardinality__ = conflict.else.__cardinality__;
      if (this.__element__.__name__ !== conflict.else.__element__.__name__) {
        expr.__element__ = $getTypeByName("std::Object");
      }
    }
    return $expressionify(expr);
  }
}
function $insertify(expr) {
  expr.unlessConflict = unlessConflict.bind(expr);
  return expr;
}
function $normaliseInsertShape(root, shape, isUpdate = false) {
  const newShape = {};
  const _shape = shape.__element__?.__kind__ === TypeKind.namedtuple ? Object.keys(shape.__element__.__shape__).map(
    (key) => [key, shape[key]]
  ) : Object.entries(shape);
  for (const [key, _val] of _shape) {
    let val = _val;
    let setModify = null;
    if (isUpdate && _val != null && typeof _val === "object") {
      const valKeys = Object.keys(_val);
      if (valKeys.length === 1 && (valKeys[0] === "+=" || valKeys[0] === "-=")) {
        val = _val[valKeys[0]];
        setModify = valKeys[0];
      }
    }
    const pointer = root.__element__.__pointers__[key];
    const isLinkProp = key[0] === "@";
    if (!pointer && !isLinkProp) {
      throw new Error(
        `Could not find property pointer for ${isUpdate ? "update" : "insert"} shape key: '${key}'`
      );
    }
    if (val === void 0) continue;
    if (val?.__kind__) {
      if (val.__kind__ === ExpressionKind.Literal && val.__element__.__kind__ === TypeKind.range && val.__element__.__element__.__name__ === "std::number") {
        newShape[key] = literal(pointer?.target, val.__value__);
      } else {
        newShape[key] = _val;
      }
      continue;
    }
    if (isLinkProp) {
      throw new Error(
        `Cannot assign plain data to link property '${key}'. Provide an expression instead.`
      );
    }
    if (!pointer) {
      throw new Error(
        "Code will never reach here, but TypeScript cannot determine"
      );
    }
    if (pointer.__kind__ !== "property" && val !== null) {
      throw new Error(
        `Must provide subquery when assigning to link '${key}' in ${isUpdate ? "update" : "insert"} query.`
      );
    }
    const isMulti = pointer.cardinality === Cardinality$1.AtLeastOne || pointer.cardinality === Cardinality$1.Many;
    const wrappedVal = val === null ? cast(pointer.target, null) : isMulti && Array.isArray(val) ? val.length === 0 ? cast(pointer.target, null) : set$1(...val.map((v) => literal(pointer.target, v))) : literal(pointer.target, val);
    newShape[key] = setModify ? { [setModify]: wrappedVal } : wrappedVal;
  }
  return newShape;
}
function insert(root, shape) {
  if (typeof shape !== "object") {
    throw new Error(
      `invalid insert shape.${typeof shape === "function" ? " Hint: Insert shape is expected to be an object, not a function returning a shape object." : ""}`
    );
  }
  const expr = {
    __kind__: ExpressionKind.Insert,
    __element__: root.__element__,
    __cardinality__: Cardinality$1.One,
    __expr__: root,
    __shape__: $normaliseInsertShape(root, shape)
  };
  expr.unlessConflict = unlessConflict.bind(expr);
  return $expressionify($insertify(expr));
}
function update(expr, shape) {
  const cleanScopedExprs = $existingScopes.size === 0;
  const scope = $getScopedExpr(expr, $existingScopes);
  const resolvedShape = shape(scope);
  if (cleanScopedExprs) {
    $existingScopes.clear();
  }
  const mods = {};
  let updateShape;
  for (const [key, val] of Object.entries(resolvedShape)) {
    if (key === "filter" || key === "filter_single") {
      mods[key] = val;
    } else if (key === "set") {
      updateShape = val;
    } else {
      throw new Error(
        `Invalid update shape key '${key}', only 'filter', 'filter_single', and 'set' are allowed`
      );
    }
  }
  if (!updateShape) {
    throw new Error(`Update shape must contain 'set' shape`);
  }
  const { modifiers, cardinality, needsAssertSingle } = $handleModifiers(mods, {
    root: expr,
    scope
  });
  const updateExpr = {
    __kind__: ExpressionKind.Update,
    __element__: expr.__element__,
    __cardinality__: cardinality,
    __expr__: expr,
    __shape__: $normaliseInsertShape(expr, updateShape, true),
    __modifiers__: modifiers,
    __scope__: scope
  };
  return needsAssertSingle ? $assert_single(updateExpr) : $expressionify(updateExpr);
}
function mapLiteralToTypeSet(literals) {
  if (Array.isArray(literals)) {
    return literals.map((lit) => lit != null ? literalToTypeSet(lit) : lit);
  }
  const obj = {};
  for (const key of Object.keys(literals)) {
    obj[key] = literals[key] != null ? literalToTypeSet(literals[key]) : literals[key];
  }
  return obj;
}
function $resolveOverload(funcName, args, typeSpec, funcDefs) {
  const positionalArgs = [];
  let namedArgs;
  if (args.length) {
    if (args[0] !== void 0) {
      try {
        positionalArgs.push(literalToTypeSet(args[0]));
      } catch {
        namedArgs = mapLiteralToTypeSet(args[0]);
      }
    } else {
      positionalArgs.push(void 0);
    }
    positionalArgs.push(...mapLiteralToTypeSet(args.slice(1)));
  }
  for (const def of funcDefs) {
    const resolvedOverload = _tryOverload(
      funcName,
      positionalArgs,
      namedArgs,
      typeSpec,
      def
    );
    if (resolvedOverload !== null) {
      return resolvedOverload;
    }
  }
  throw new Error(
    `No function overload found for ${funcName.includes("::") ? `'e.${funcName.split("::").join(".")}()'` : `operator '${funcName}'`} with args: ${[...positionalArgs, ...Object.values(namedArgs ?? {})].filter(Boolean).map(
      (arg) => `Element: ${arg.__element__.__name__} (${arg.__cardinality__})`
    ).join(", ")}`
  );
}
const ANYTYPE_ARG = Symbol();
function _tryOverload(funcName, args, namedArgs, typeSpec, funcDef) {
  if (funcDef.namedArgs === void 0 && namedArgs !== void 0 || namedArgs === void 0 && funcDef.namedArgs && Object.values(funcDef.namedArgs).some((arg) => !arg.optional)) {
    return null;
  }
  const lastParamVariadic = funcDef.args[funcDef.args.length - 1]?.variadic;
  if (!lastParamVariadic && args.length > funcDef.args.length) {
    return null;
  }
  const paramCardinalities = [Cardinality$1.One];
  if (namedArgs) {
    for (const [key, value] of Object.entries(namedArgs)) {
      const argDef = funcDef.namedArgs?.[key];
      if (!argDef || !compareType(typeSpec, argDef.typeId, value.__element__).match) {
        return null;
      }
      paramCardinalities.push(
        argDef.setoftype ? funcDef.preservesOptionality ? cardutil.overrideUpperBound(value.__cardinality__, "One") : Cardinality$1.One : argDef.optional ? cardutil.overrideLowerBound(value.__cardinality__, "One") : value.__cardinality__
      );
    }
  }
  let positionalArgs = [];
  let returnAnytype;
  let needsAnytypeReplacement = false;
  for (let i = 0; i < funcDef.args.length; i++) {
    const argDef = funcDef.args[i];
    const arg = args[i];
    if (arg === void 0) {
      if (!argDef.optional) {
        return null;
      }
      if (i < args.length) {
        const argTypeName = typeSpec.get(argDef.typeId).name;
        if (argTypeName.includes("anytype") || argTypeName.includes("std::anypoint")) {
          if (!returnAnytype) {
            positionalArgs.push(ANYTYPE_ARG);
            needsAnytypeReplacement = true;
          } else {
            positionalArgs.push(cast(returnAnytype, null));
          }
        } else {
          const argType = makeType(typeSpec, argDef.typeId, literal);
          positionalArgs.push(cast(argType, null));
        }
      }
    } else {
      const { match, anytype } = compareType(
        typeSpec,
        argDef.typeId,
        arg.__element__
      );
      if (!match) {
        return null;
      }
      if (!returnAnytype && anytype) {
        returnAnytype = anytype;
      }
      positionalArgs.push(
        ...argDef.variadic ? args.slice(i) : [arg]
      );
      if (argDef.setoftype) {
        paramCardinalities.push(
          funcDef.preservesOptionality ? cardutil.overrideUpperBound(arg.__cardinality__, "One") : Cardinality$1.One
        );
      } else {
        const card = argDef.variadic ? cardutil.multiplyCardinalitiesVariadic(
          args.slice(i).map(
            (el) => el.__cardinality__
          )
        ) : arg.__cardinality__;
        paramCardinalities.push(
          argDef.optional ? cardutil.overrideLowerBound(card, "One") : card
        );
      }
    }
  }
  let cardinality;
  if (funcName === "if_else") {
    cardinality = cardutil.multiplyCardinalities(
      cardutil.orCardinalities(
        positionalArgs[0].__cardinality__,
        positionalArgs[2].__cardinality__
      ),
      positionalArgs[1].__cardinality__
    );
  } else if (funcName === "std::assert_exists") {
    cardinality = cardutil.overrideLowerBound(
      positionalArgs[0].__cardinality__,
      "One"
    );
  } else if (funcName === "union") {
    cardinality = cardutil.mergeCardinalities(
      positionalArgs[0].__cardinality__,
      positionalArgs[1].__cardinality__
    );
  } else if (funcName === "??") {
    cardinality = cardutil.coalesceCardinalities(
      positionalArgs[0].__cardinality__,
      positionalArgs[1].__cardinality__
    );
  } else if (funcName === "distinct") {
    cardinality = positionalArgs[0].__cardinality__;
  } else {
    cardinality = funcDef.returnTypemod === "SetOfType" ? Cardinality$1.Many : cardutil.multiplyCardinalitiesVariadic(paramCardinalities);
    if (funcDef.returnTypemod === "OptionalType" && !funcDef.preservesOptionality) {
      cardinality = cardutil.overrideLowerBound(cardinality, "Zero");
    }
  }
  if (needsAnytypeReplacement) {
    if (!returnAnytype) {
      throw new Error(`could not resolve anytype for ${funcName}`);
    }
    positionalArgs = positionalArgs.map(
      (arg) => arg === ANYTYPE_ARG ? cast(returnAnytype, null) : arg
    );
  }
  return {
    kind: funcDef.kind,
    returnType: makeType(
      typeSpec,
      funcDef.returnTypeId,
      literal,
      returnAnytype
    ),
    cardinality,
    args: positionalArgs,
    namedArgs: namedArgs ?? {}
  };
}
const nameRemapping = {
  "std::int16": "std::number",
  "std::int32": "std::number",
  "std::int64": "std::number",
  "std::float32": "std::number",
  "std::float64": "std::number"
};
const descendantCache = /* @__PURE__ */ new Map();
function getDescendantNames(typeSpec, typeId) {
  if (descendantCache.has(typeId)) {
    return descendantCache.get(typeId);
  }
  const descendants = [
    ...new Set(
      [...typeSpec.values()].filter(
        (type) => type.kind === "scalar" && type.bases.some(({ id }) => id === typeId)
      ).flatMap(
        (type) => type.is_abstract ? getDescendantNames(typeSpec, type.id) : [nameRemapping[type.name], type.name]
      )
    )
  ];
  descendantCache.set(typeId, descendants);
  return descendants;
}
function compareType(typeSpec, typeId, arg) {
  const type = typeSpec.get(typeId);
  if (type.name === "anytype") {
    return { match: true, anytype: arg };
  }
  if (type.name === "anyobject") {
    return { match: arg.__kind__ === TypeKind.object, anytype: arg };
  }
  if (type.name === "std::anypoint") {
    const descendants = getDescendantNames(typeSpec, typeId);
    if (descendants.includes(arg.__name__)) {
      return { match: true, anytype: arg };
    }
  }
  if (type.name === "std::anyenum") {
    return { match: arg.__kind__ === TypeKind.enum };
  }
  if (type.kind === "scalar") {
    arg = arg.__casttype__ ?? arg;
    return {
      match: (arg.__kind__ === TypeKind.scalar || arg.__kind__ === TypeKind.enum) && (arg.__name__ === type.name || isImplicitlyCastableTo(arg.__name__, type.name))
    };
  }
  if (type.kind === "array") {
    if (arg.__kind__ === TypeKind.array) {
      return compareType(
        typeSpec,
        type.array_element_id,
        arg.__element__
      );
    }
  }
  if (type.kind === "range") {
    if (arg.__kind__ === TypeKind.range) {
      return compareType(
        typeSpec,
        type.range_element_id,
        arg.__element__
      );
    }
  }
  if (type.kind === "multirange") {
    if (arg.__kind__ === TypeKind.multirange) {
      return compareType(
        typeSpec,
        type.multirange_element_id,
        arg.__element__
      );
    }
  }
  if (type.kind === "object") {
    if (arg.__kind__ !== TypeKind.object) return { match: false };
    const objectArg = arg;
    let match = true;
    for (const ptr of type.pointers) {
      if (objectArg.__pointers__[ptr.name]) {
        const argPtr = objectArg.__pointers__[ptr.name];
        const ptrTarget = typeSpec.get(ptr.target_id);
        if (ptrTarget.name !== argPtr.target.__name__ || ptr.card !== argPtr.cardinality) {
          match = false;
        }
      }
    }
    return {
      match
    };
  }
  if (type.kind === "tuple") {
    const items = arg.__kind__ === TypeKind.tuple ? arg.__items__ : arg.__kind__ === TypeKind.namedtuple ? arg.__shape__ : null;
    if (items) {
      const keys = Object.keys(items);
      if (keys.length === type.tuple_elements.length) {
        let anytype;
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] !== type.tuple_elements[i].name) {
            return { match: false };
          }
          const { match: m, anytype: a } = compareType(
            typeSpec,
            type.tuple_elements[i].target_id,
            items[keys[i]]
          );
          if (!m) {
            return { match: false };
          }
          if (a) anytype = a;
        }
        return { match: true, anytype };
      }
    }
  }
  return { match: false };
}
function _for(set2, expr) {
  const forVar = $expressionify({
    __kind__: ExpressionKind.ForVar,
    __element__: set2.__element__,
    __cardinality__: Cardinality$1.One
  });
  const returnExpr = expr(forVar);
  return $expressionify({
    __kind__: ExpressionKind.For,
    __element__: returnExpr.__element__,
    __cardinality__: cardutil.multiplyCardinalities(
      set2.__cardinality__,
      returnExpr.__cardinality__
    ),
    __iterSet__: set2,
    __expr__: returnExpr,
    __forVar__: forVar
  });
}
function alias(expr) {
  return $expressionify({
    __kind__: ExpressionKind.Alias,
    __element__: expr.__element__,
    __cardinality__: expr.__cardinality__,
    __expr__: expr
  });
}
function _with(refs, expr) {
  return $expressionify({
    __kind__: ExpressionKind.With,
    __element__: expr.__element__,
    __cardinality__: expr.__cardinality__,
    __refs__: refs,
    __expr__: expr
  });
}
function optional(type) {
  return {
    __kind__: ExpressionKind.OptionalParam,
    __type__: type
  };
}
function params(paramsDef, expr) {
  const paramExprs = {};
  for (const [key, param] of Object.entries(paramsDef)) {
    const paramType = param.__kind__ === ExpressionKind.OptionalParam ? param.__type__ : param;
    const isComplex = complexParamKinds.has(paramType.__kind__) || paramType.__kind__ === TypeKind.array && complexParamKinds.has(paramType.__element__.__kind__);
    paramExprs[key] = $expressionify({
      __kind__: ExpressionKind.Param,
      __element__: paramType,
      __cardinality__: param.__kind__ === ExpressionKind.OptionalParam ? Cardinality$1.AtMostOne : Cardinality$1.One,
      __name__: key,
      __isComplex__: isComplex
    });
  }
  let returnExpr = expr(paramExprs);
  if (!runnableExpressionKinds.has(returnExpr.__kind__)) {
    returnExpr = select(returnExpr);
  }
  return $expressionify({
    __kind__: ExpressionKind.WithParams,
    __element__: returnExpr.__element__,
    __cardinality__: returnExpr.__cardinality__,
    __expr__: returnExpr,
    __params__: Object.values(paramExprs)
  });
}
function detached(expr) {
  return $expressionify({
    __element__: expr.__element__,
    __cardinality__: expr.__cardinality__,
    __expr__: expr,
    __kind__: ExpressionKind.Detached
  });
}
function isGroupingSet(arg) {
  return arg.__kind__ === "groupingset";
}
const makeGroupingSet = (prefix) => (grps) => {
  const seenKeys = /* @__PURE__ */ new Map();
  const unfiltered = Object.entries(grps).flatMap(
    ([k, grp]) => isGroupingSet(grp) ? grp.__exprs__ : [[k, grp]]
  );
  const filtered = unfiltered.filter(([k, expr]) => {
    if (!seenKeys.has(k)) {
      seenKeys.set(k, expr);
      return true;
    }
    if (expr !== seenKeys.get(k)) {
      throw new Error(
        `Cannot override pre-existing expression with key "${k}"`
      );
    }
    return false;
  });
  return {
    [`${Math.round(1e6 * Math.random())}___`]: {
      __kind__: "groupingset",
      __settype__: prefix,
      __elements__: grps,
      __exprs__: filtered
    }
  };
};
const set = makeGroupingSet("set");
const tuple = makeGroupingSet("tuple");
const rollup = makeGroupingSet("rollup");
const cube = makeGroupingSet("cube");
const setFuncs = { set, tuple, rollup, cube };
const groupFunc = (expr, getter) => {
  const { shape, scope, modifiers } = resolveShape(getter, expr);
  const groupSet = tuple(modifiers.by);
  const key = Object.keys(groupSet)[0];
  const grouping = groupSet[key];
  const keyShape = {};
  const keyPointers = {};
  for (const [k, e] of grouping.__exprs__) {
    keyShape[k] = $expressionify({
      __element__: e.__element__,
      __cardinality__: Cardinality$1.AtMostOne
    });
    keyPointers[k] = {
      __kind__: "property",
      target: e.__element__,
      cardinality: Cardinality$1.AtMostOne,
      exclusive: false,
      computed: false,
      readonly: false,
      hasDefault: false
    };
  }
  const $FreeObject2 = makeType(
    spec,
    [...spec.values()].find((s) => s.name === "std::FreeObject").id,
    literal
  );
  const str2 = makeType(
    spec,
    [...spec.values()].find((s) => s.name === "std::str").id,
    literal
  );
  return $expressionify({
    __element__: {
      ...$FreeObject2,
      __name__: "std::FreeObject",
      __pointers__: {
        ...$FreeObject2.__pointers__,
        __name__: "std::FreeObject",
        grouping: {
          __kind__: "property",
          target: str2,
          cardinality: Cardinality$1.Many,
          exclusive: false,
          computed: false,
          readonly: false,
          hasDefault: false
        },
        key: {
          __kind__: "link",
          target: {
            ...$FreeObject2,
            __name__: "std::FreeObject",
            __pointers__: {
              ...$FreeObject2.__pointers__,
              ...keyPointers
            },
            __shape__: keyShape
          },
          properties: {},
          cardinality: Cardinality$1.One,
          exclusive: false,
          computed: false,
          readonly: false,
          hasDefault: false
        },
        elements: {
          __kind__: "link",
          target: expr.__element__,
          cardinality: Cardinality$1.Many,
          properties: {},
          exclusive: false,
          computed: false,
          readonly: false,
          hasDefault: false
        }
      },
      __shape__: {
        grouping: $expressionify({
          __element__: str2,
          __cardinality__: Cardinality$1.Many
        }),
        key: $expressionify({
          __element__: {
            ...$FreeObject2,
            __shape__: keyShape
          },
          __cardinality__: Cardinality$1.One
        }),
        elements: $expressionify({
          __element__: { ...expr.__element__, __shape__: shape },
          __cardinality__: Cardinality$1.Many
        })
      }
    },
    __cardinality__: Cardinality$1.Many,
    __expr__: expr,
    __modifiers__: { by: grouping },
    __kind__: ExpressionKind.Group,
    __scope__: scope
  });
};
Object.assign(groupFunc, setFuncs);
function resolveShape(shapeGetter, expr) {
  const modifiers = {};
  const shape = {};
  const scope = $getScopedExpr(expr);
  const selectShape = typeof shapeGetter === "function" ? shapeGetter(scope) : shapeGetter;
  for (const [key, value] of Object.entries(selectShape)) {
    if (key === "by") {
      modifiers[key] = value;
    } else {
      if (expr.__element__.__kind__ !== TypeKind.object) {
        throw new Error(
          `Invalid select shape key '${key}' on scalar expression, only modifiers are allowed (filter, order_by, offset and limit)`
        );
      }
      shape[key] = resolveShapeElement(key, value, scope);
    }
  }
  if (Object.keys(shape).length === 0) {
    shape.id = true;
  }
  if (!modifiers.by) {
    throw new Error("Must provide a `by` key in `e.group`");
  }
  return { shape, modifiers, scope };
}
const group = groupFunc;
function makeGlobal(name, type, card) {
  return $expressionify({
    __name__: name,
    __element__: type,
    __cardinality__: card,
    __kind__: ExpressionKind.Global
  });
}
function range$1(...args) {
  if (args.length === 1) {
    const arg = args[0];
    if (arg instanceof Range$1) {
      if (arg.lower === null && arg.upper === null) {
        throw new Error(
          `Can't create literal expression from unbounded range. Try this instead:

  e.range(e.cast(e.int64, e.set()), e.cast(e.int64, e.set()))`
        );
      }
      if (arg.isEmpty) {
        throw new Error(`Can't create literal expression from empty range.`);
      }
      return literal(
        range$1(literalToTypeSet(arg.lower ?? arg.upper).__element__),
        arg
      );
    }
    if (arg.__kind__ && !arg.__element__) {
      return {
        __kind__: TypeKind.range,
        __name__: `range<${arg.__name__}>`,
        __element__: arg
      };
    }
  }
  const {
    returnType,
    cardinality,
    args: positionalArgs,
    namedArgs
  } = $resolveOverload("std::range", args, spec, [
    {
      args: [
        {
          typeId: $nameMapping.get("std::anypoint"),
          optional: true,
          setoftype: false,
          variadic: false
        },
        {
          typeId: $nameMapping.get("std::anypoint"),
          optional: true,
          setoftype: false,
          variadic: false
        }
      ],
      namedArgs: {
        inc_lower: {
          typeId: $nameMapping.get("std::bool"),
          optional: true,
          setoftype: false,
          variadic: false
        },
        inc_upper: {
          typeId: $nameMapping.get("std::bool"),
          optional: true,
          setoftype: false,
          variadic: false
        },
        empty: {
          typeId: $nameMapping.get("std::bool"),
          optional: true,
          setoftype: false,
          variadic: false
        }
      },
      returnTypeId: $nameMapping.get("range<std::anypoint>")
    }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::range",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const $syntax = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  $PathLeaf: PathLeaf,
  $PathNode: PathNode,
  $arrayLikeIndexify,
  $assert_single,
  $existingScopes,
  $expressionify,
  $getScopedExpr,
  $getType,
  $getTypeByName,
  $handleModifiers,
  $insertify,
  $jsonDestructure,
  $nameMapping,
  $normaliseInsertShape,
  $objectTypeToTupleType,
  $pathify,
  $range: range$1,
  $resolveOverload,
  $selectify,
  $toEdgeQL,
  $tuplePathify,
  ASC,
  DESC,
  EMPTY_FIRST,
  EMPTY_LAST,
  alias,
  array,
  cast,
  delete: deleteExpr,
  detached,
  for: _for,
  getSharedParent,
  group,
  insert,
  is,
  isGroupingSet,
  literal,
  makeGlobal,
  optional,
  params,
  resolveShapeElement,
  select,
  set: set$1,
  shape: $shape,
  tuple: tuple$1,
  update,
  with: _with
}, Symbol.toStringTag, { value: "Module" }));
const overloadDefs = {
  Infix: {
    "=": [
      { kind: "Infix", args: [{ typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }, { typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }, { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }, { typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "15315dad-c4ad-5335-97d6-4612e66ffb71", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "?=": [
      { kind: "Infix", args: [{ typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: true, setoftype: false, variadic: false }, { typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000002", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000002", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: true, setoftype: false, variadic: false }, { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: true, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000100", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: true, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: true, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: true, setoftype: false, variadic: false }, { typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000130", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000130", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: true, setoftype: false, variadic: false }, { typeId: "15315dad-c4ad-5335-97d6-4612e66ffb71", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "!=": [
      { kind: "Infix", args: [{ typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }, { typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }, { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }, { typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "15315dad-c4ad-5335-97d6-4612e66ffb71", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "?!=": [
      { kind: "Infix", args: [{ typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: true, setoftype: false, variadic: false }, { typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000002", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000002", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: true, setoftype: false, variadic: false }, { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: true, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000100", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: true, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: true, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: true, setoftype: false, variadic: false }, { typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000130", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000130", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: true, setoftype: false, variadic: false }, { typeId: "15315dad-c4ad-5335-97d6-4612e66ffb71", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    ">=": [
      { kind: "Infix", args: [{ typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }, { typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }, { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }, { typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "15315dad-c4ad-5335-97d6-4612e66ffb71", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    ">": [
      { kind: "Infix", args: [{ typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }, { typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }, { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }, { typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "15315dad-c4ad-5335-97d6-4612e66ffb71", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "<=": [
      { kind: "Infix", args: [{ typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }, { typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }, { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }, { typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "15315dad-c4ad-5335-97d6-4612e66ffb71", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "<": [
      { kind: "Infix", args: [{ typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }, { typeId: "a64cb492-91a2-5ee0-890a-6caeb3e32aa5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000002", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }, { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }, { typeId: "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000130", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "15315dad-c4ad-5335-97d6-4612e66ffb71", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "or": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "and": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "+": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010e" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "c3231f27-c8a1-5a0c-9830-c71206020eac" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000112" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" }
    ],
    "-": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010e" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010e" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "c3231f27-c8a1-5a0c-9830-c71206020eac" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000112" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000112" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" }
    ],
    "*": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
      { kind: "Infix", args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2" },
      { kind: "Infix", args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "c3231f27-c8a1-5a0c-9830-c71206020eac" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
    ],
    "/": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
    ],
    "//": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
    ],
    "%": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
    ],
    "^": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
    ],
    "in": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "not in": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "union": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType" }
    ],
    "except": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType" }
    ],
    "intersect": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType" }
    ],
    "??": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: true, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType" }
    ],
    "++": [
      { kind: "Infix", args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010f" }
    ],
    "like": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "ilike": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "not like": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "not ilike": [
      { kind: "Infix", args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ]
  },
  Postfix: {},
  Prefix: {
    "not": [
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "+": [
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
    ],
    "-": [
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010e" },
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" },
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" }
    ],
    "exists": [
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
    ],
    "distinct": [
      { kind: "Prefix", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType" }
    ]
  },
  Ternary: {
    "if_else": [
      { kind: "Ternary", args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType" }
    ]
  }
};
function op(...args) {
  let op2 = "";
  let params2 = [];
  let defs = null;
  if (args.length === 2) {
    if (typeof args[0] === "string" && overloadDefs.Prefix[args[0]]) {
      op2 = args[0];
      params2 = [args[1]];
      defs = overloadDefs.Prefix[op2];
    } else if (typeof args[1] === "string" && overloadDefs.Postfix[args[1]]) {
      op2 = args[1];
      params2 = [args[0]];
      defs = overloadDefs.Postfix[op2];
    }
  } else if (args.length === 3) {
    if (typeof args[1] === "string") {
      op2 = args[1];
      params2 = [args[0], args[2]];
      defs = overloadDefs.Infix[op2];
    }
  } else if (args.length === 5) {
    if (typeof args[1] === "string" && typeof args[3] === "string") {
      op2 = `${args[1]}_${args[3]}`;
      params2 = [args[0], args[2], args[4]];
      defs = overloadDefs.Ternary[op2];
    }
  } else if (args.length === 6) {
    if (typeof args[0] === "string" && typeof args[2] === "string" && typeof args[4] === "string") {
      op2 = `${args[0]}_${args[4]}`;
      params2 = [args[3], args[1], args[5]];
      defs = overloadDefs.Ternary[op2];
    }
  }
  if (!defs) {
    throw new Error(`No operator exists with signature: ${args.map((arg) => `${arg}`).join(", ")}`);
  }
  const { kind, returnType, cardinality, args: resolvedArgs } = $resolveOverload(op2, params2, spec, defs);
  return $expressionify({
    __kind__: ExpressionKind.Operator,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: op2,
    __opkind__: kind,
    __args__: resolvedArgs
  });
}
const $op = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  op
}, Symbol.toStringTag, { value: "Module" }));
const date_duration = makeType(spec, "00000000-0000-0000-0000-000000000112", literal);
const local_date = makeType(spec, "00000000-0000-0000-0000-00000000010c", literal);
const local_datetime = makeType(spec, "00000000-0000-0000-0000-00000000010b", literal);
const local_time = makeType(spec, "00000000-0000-0000-0000-00000000010d", literal);
const relative_duration = makeType(spec, "00000000-0000-0000-0000-000000000111", literal);
function to_local_datetime(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::to_local_datetime", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" },
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::to_local_datetime",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_local_date(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::to_local_date", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c" },
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::to_local_date",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_local_time(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::to_local_time", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d" },
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::to_local_time",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_relative_duration(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::to_relative_duration", args, spec, [
    { args: [], namedArgs: { "years": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "months": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "days": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "hours": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "minutes": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "seconds": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "microseconds": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000111" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::to_relative_duration",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_date_duration(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::to_date_duration", args, spec, [
    { args: [], namedArgs: { "years": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "months": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "days": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000112" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::to_date_duration",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function time_get(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::time_get", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::time_get",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function date_get(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::date_get", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::date_get",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function duration_normalize_hours(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::duration_normalize_hours", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::duration_normalize_hours",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function duration_normalize_days(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::cal::duration_normalize_days", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000112" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::cal::duration_normalize_days",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports$e = {
  "date_duration": date_duration,
  "local_date": local_date,
  "local_datetime": local_datetime,
  "local_time": local_time,
  "relative_duration": relative_duration,
  "to_local_datetime": to_local_datetime,
  "to_local_date": to_local_date,
  "to_local_time": to_local_time,
  "to_relative_duration": to_relative_duration,
  "to_date_duration": to_date_duration,
  "time_get": time_get,
  "date_get": date_get,
  "duration_normalize_hours": duration_normalize_hours,
  "duration_normalize_days": duration_normalize_days
};
const Base64Alphabet = makeType(spec, "5ca96424-93ba-560a-994b-7820c9623e3d", literal);
function base64_encode(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::enc::base64_encode", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], namedArgs: { "alphabet": { typeId: "5ca96424-93ba-560a-994b-7820c9623e3d", optional: true, setoftype: false, variadic: false }, "padding": { typeId: "00000000-0000-0000-0000-000000000109", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::enc::base64_encode",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function base64_decode(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::enc::base64_decode", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], namedArgs: { "alphabet": { typeId: "5ca96424-93ba-560a-994b-7820c9623e3d", optional: true, setoftype: false, variadic: false }, "padding": { typeId: "00000000-0000-0000-0000-000000000109", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000102" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::enc::base64_decode",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports$d = {
  "Base64Alphabet": Base64Alphabet,
  "base64_encode": base64_encode,
  "base64_decode": base64_decode
};
const ElasticLanguage = makeType(spec, "de04eafc-46d5-5037-aae6-52774a4cf421", literal);
const Language = makeType(spec, "efb3a506-d101-5c65-b845-abf56604c8e3", literal);
const LuceneLanguage = makeType(spec, "17c3aca3-4464-5257-bc9f-591fb7bf704c", literal);
const PGLanguage = makeType(spec, "f613baf6-1ed8-557e-8f68-e91a0d39e65d", literal);
const Weight = makeType(spec, "cb579c2d-cc54-54e6-9636-fff6c1643771", literal);
const document = makeType(spec, "1d63520b-60fc-5ffe-a70c-ebdb1b3887c2", literal);
function with_options(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::fts::with_options", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], namedArgs: { "language": { typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: false, variadic: false }, "weight_category": { typeId: "cb579c2d-cc54-54e6-9636-fff6c1643771", optional: true, setoftype: false, variadic: false } }, returnTypeId: "1d63520b-60fc-5ffe-a70c-ebdb1b3887c2" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::fts::with_options",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function search(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::fts::search", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000003", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], namedArgs: { "language": { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }, "weights": { typeId: "2b65df4c-4942-59b1-8819-061ca68b2f4e", optional: true, setoftype: false, variadic: false } }, returnTypeId: "c13eb6f1-a05c-533f-bfe8-a50b1a077fd0", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::fts::search",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports$c = {
  "ElasticLanguage": ElasticLanguage,
  "Language": Language,
  "LuceneLanguage": LuceneLanguage,
  "PGLanguage": PGLanguage,
  "Weight": Weight,
  "document": document,
  "with_options": with_options,
  "search": search
};
const Method = makeType(spec, "8896d50c-81c2-5d7d-bb2f-cb2bfba3c628", literal);
const $Response = makeType(spec, "6f217eab-7720-5bbc-8b1f-b02098bc9a4e", literal);
const Response = PathNode($toSet($Response, Cardinality$1.Many), null);
const $ScheduledRequest = makeType(spec, "e6bf05a7-60c7-51dd-b30d-c8fce5bcadfd", literal);
const ScheduledRequest = PathNode($toSet($ScheduledRequest, Cardinality$1.Many), null);
function schedule_request(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::net::http::schedule_request", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], namedArgs: { "body": { typeId: "00000000-0000-0000-0000-000000000102", optional: true, setoftype: false, variadic: false }, "headers": { typeId: "29b1b6f1-a0e0-577d-adcf-e493f6b2303a", optional: true, setoftype: false, variadic: false }, "method": { typeId: "8896d50c-81c2-5d7d-bb2f-cb2bfba3c628", optional: true, setoftype: false, variadic: false } }, returnTypeId: "e6bf05a7-60c7-51dd-b30d-c8fce5bcadfd" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::net::http::schedule_request",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports$b = {
  "Method": Method,
  "Response": Response,
  "ScheduledRequest": ScheduledRequest,
  "schedule_request": schedule_request
};
const RequestFailureKind = makeType(spec, "8b93ef2e-2ddd-5ba2-9333-2e28a4d56ede", literal);
const RequestState = makeType(spec, "5b46c56e-937c-59d2-b3e6-99c31c7c60f0", literal);
const __defaultExports$a = {
  "RequestFailureKind": RequestFailureKind,
  "RequestState": RequestState,
  "http": __defaultExports$b
};
const date = makeType(spec, "00000000-0000-0000-0000-000001000004", literal);
const interval = makeType(spec, "00000000-0000-0000-0000-000001000005", literal);
const json$1 = makeType(spec, "00000000-0000-0000-0000-000001000001", literal);
const timestamp = makeType(spec, "00000000-0000-0000-0000-000001000003", literal);
const timestamptz = makeType(spec, "00000000-0000-0000-0000-000001000002", literal);
const __defaultExports$9 = {
  "date": date,
  "interval": interval,
  "json": json$1,
  "timestamp": timestamp,
  "timestamptz": timestamptz
};
function lg(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::lg", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::lg",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function log(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::log", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], namedArgs: { "base": { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::log",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function sqrt(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::sqrt", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::sqrt",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function abs(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::abs", args, spec, [
    { args: [{ typeId: "04976545-1176-5536-8673-c9f7d18d581b", optional: false, setoftype: false, variadic: false }], returnTypeId: "04976545-1176-5536-8673-c9f7d18d581b" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::abs",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function ceil(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::ceil", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::ceil",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function floor(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::floor", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::floor",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function ln(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::ln", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::ln",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function mean(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::mean", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::mean",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function stddev(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::stddev", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::stddev",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function stddev_pop(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::stddev_pop", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::stddev_pop",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function var_6499cc9d9d4c58bcaa35075aa52c9823(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::var", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff", returnTypemod: "OptionalType" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::var",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function var_pop(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::var_pop", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff", returnTypemod: "OptionalType" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::var_pop",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function pi(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::pi", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::pi",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function acos(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::acos", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::acos",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function asin(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::asin", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::asin",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function atan(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::atan", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::atan",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function atan2(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::atan2", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::atan2",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function cos(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::cos", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::cos",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function cot(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::cot", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::cot",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function sin(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::sin", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::sin",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function tan(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::math::tan", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::math::tan",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports$8 = {
  "lg": lg,
  "log": log,
  "sqrt": sqrt,
  "abs": abs,
  "ceil": ceil,
  "floor": floor,
  "ln": ln,
  "mean": mean,
  "stddev": stddev,
  "stddev_pop": stddev_pop,
  "var": var_6499cc9d9d4c58bcaa35075aa52c9823,
  "var_pop": var_pop,
  "pi": pi,
  "acos": acos,
  "asin": asin,
  "atan": atan,
  "atan2": atan2,
  "cos": cos,
  "cot": cot,
  "sin": sin,
  "tan": tan
};
const Endian = makeType(spec, "e4a1d11b-227e-5744-a0c9-31f9cd756e7b", literal);
const JsonEmpty = makeType(spec, "584feb89-c83d-561d-aa78-24e6d779f044", literal);
const bigint = makeType(spec, "00000000-0000-0000-0000-000000000110", literal);
const bool = makeType(spec, "00000000-0000-0000-0000-000000000109", literal);
const bytes = makeType(spec, "00000000-0000-0000-0000-000000000102", literal);
const datetime = makeType(spec, "00000000-0000-0000-0000-00000000010a", literal);
const decimal = makeType(spec, "00000000-0000-0000-0000-000000000108", literal);
const duration = makeType(spec, "00000000-0000-0000-0000-00000000010e", literal);
const float32 = makeType(spec, "00000000-0000-0000-0000-000000000106", literal);
const float64 = makeType(spec, "00000000-0000-0000-0000-000000000107", literal);
const int16 = makeType(spec, "00000000-0000-0000-0000-000000000103", literal);
const int32 = makeType(spec, "00000000-0000-0000-0000-000000000104", literal);
const int64 = makeType(spec, "00000000-0000-0000-0000-000000000105", literal);
const json = makeType(spec, "00000000-0000-0000-0000-00000000010f", literal);
makeType(spec, "fd1c52ea-74a9-541b-88e2-378d1edb02fd", literal);
const str = makeType(spec, "00000000-0000-0000-0000-000000000101", literal);
const uuid = makeType(spec, "00000000-0000-0000-0000-000000000100", literal);
makeType(spec, "00000000-0000-0000-0000-0000000001ff", literal);
const $BaseObject = makeType(spec, "0d14e49f-d9f9-51f0-b8f4-c432982cbac2", literal);
const BaseObject = PathNode($toSet($BaseObject, Cardinality$1.Many), null);
const $Object_8ce8c71ee4fa5f73840c22d7eaa58588 = makeType(spec, "8ce8c71e-e4fa-5f73-840c-22d7eaa58588", literal);
const Object_8ce8c71ee4fa5f73840c22d7eaa58588 = PathNode($toSet($Object_8ce8c71ee4fa5f73840c22d7eaa58588, Cardinality$1.Many), null);
const $FreeObject = makeType(spec, "3b741934-07ef-5b95-b7d6-cdc864fd2ae8", literal);
const FreeObject = PathNode($toSet($FreeObject, Cardinality$1.One), null);
function assert_single(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::assert_single", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], namedArgs: { "message": { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "OptionalType", preservesOptionality: true }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::assert_single",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function assert_exists(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::assert_exists", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], namedArgs: { "message": { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::assert_exists",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function assert_distinct(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::assert_distinct", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], namedArgs: { "message": { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType", preservesOptionality: true }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::assert_distinct",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function assert(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::assert", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: false, variadic: false }], namedArgs: { "message": { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::assert",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function materialized(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::materialized", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::materialized",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function len(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::len", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::len",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function sum(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::sum", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::sum",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function count(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::count", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::count",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function random(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::random", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::random",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function min(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::min", args, spec, [
    { args: [{ typeId: "04976545-1176-5536-8673-c9f7d18d581b", optional: false, setoftype: true, variadic: false }], returnTypeId: "04976545-1176-5536-8673-c9f7d18d581b", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: true, variadic: false }], returnTypeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010e", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000112", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "c05958e2-0753-5a63-b7c4-db3626b0d6b5", optional: false, setoftype: true, variadic: false }], returnTypeId: "c05958e2-0753-5a63-b7c4-db3626b0d6b5", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "8571477b-d954-5809-b360-4b1f03253699", optional: false, setoftype: true, variadic: false }], returnTypeId: "8571477b-d954-5809-b360-4b1f03253699", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "75ba1b6e-7f51-5c49-b955-e32f20e4f72e", optional: false, setoftype: true, variadic: false }], returnTypeId: "75ba1b6e-7f51-5c49-b955-e32f20e4f72e", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "d50ba716-d5fd-5f69-8afe-9c82fe7436d9", optional: false, setoftype: true, variadic: false }], returnTypeId: "d50ba716-d5fd-5f69-8afe-9c82fe7436d9", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "5b410a6f-a231-524b-8682-4ce2020c1d98", optional: false, setoftype: true, variadic: false }], returnTypeId: "5b410a6f-a231-524b-8682-4ce2020c1d98", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "OptionalType", preservesOptionality: true }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::min",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function max(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::max", args, spec, [
    { args: [{ typeId: "04976545-1176-5536-8673-c9f7d18d581b", optional: false, setoftype: true, variadic: false }], returnTypeId: "04976545-1176-5536-8673-c9f7d18d581b", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", optional: false, setoftype: true, variadic: false }], returnTypeId: "48896eaf-b8af-5f80-9073-0884475d6ee5", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010e", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010d", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000112", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "c05958e2-0753-5a63-b7c4-db3626b0d6b5", optional: false, setoftype: true, variadic: false }], returnTypeId: "c05958e2-0753-5a63-b7c4-db3626b0d6b5", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "8571477b-d954-5809-b360-4b1f03253699", optional: false, setoftype: true, variadic: false }], returnTypeId: "8571477b-d954-5809-b360-4b1f03253699", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "75ba1b6e-7f51-5c49-b955-e32f20e4f72e", optional: false, setoftype: true, variadic: false }], returnTypeId: "75ba1b6e-7f51-5c49-b955-e32f20e4f72e", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "d50ba716-d5fd-5f69-8afe-9c82fe7436d9", optional: false, setoftype: true, variadic: false }], returnTypeId: "d50ba716-d5fd-5f69-8afe-9c82fe7436d9", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "5b410a6f-a231-524b-8682-4ce2020c1d98", optional: false, setoftype: true, variadic: false }], returnTypeId: "5b410a6f-a231-524b-8682-4ce2020c1d98", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111", returnTypemod: "OptionalType", preservesOptionality: true },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "OptionalType", preservesOptionality: true }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::max",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function all(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::all", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::all",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function any(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::any", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000109", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::any",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function enumerate(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::enumerate", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "e34cf562-ee0c-58d3-a1ee-ff9fbb35bfc3", returnTypemod: "SetOfType", preservesOptionality: true }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::enumerate",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function round(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::round", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::round",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function contains(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::contains", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "581b0325-a044-58d4-aa37-3a85ea671313", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "581b0325-a044-58d4-aa37-3a85ea671313", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c38cc584-72e2-5b3d-a9cc-e8e256c2dd0d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "74568c88-a8c3-5a02-9acd-64616d07ab8b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::contains",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function array_fill(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::array_fill", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::array_fill",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function find(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::find", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::find",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bit_and(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bit_and", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bit_and",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bit_or(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bit_or", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bit_or",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bit_xor(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bit_xor", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bit_xor",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bit_not(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bit_not", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bit_not",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bit_rshift(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bit_rshift", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bit_rshift",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bit_lshift(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bit_lshift", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bit_lshift",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bit_count(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bit_count", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bit_count",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function array_agg(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::array_agg", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: true, variadic: false }], returnTypeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::array_agg",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function array_unpack(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::array_unpack", args, spec, [
    { args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "SetOfType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::array_unpack",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function array_replace(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::array_replace", args, spec, [
    { args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }], returnTypeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::array_replace",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function array_get(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::array_get", args, spec, [
    { args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], namedArgs: { "default": { typeId: "00000000-0000-0000-0000-000000000001", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000001", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::array_get",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function array_set(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::array_set", args, spec, [
    { args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }], returnTypeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::array_set",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function array_insert(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::array_insert", args, spec, [
    { args: [{ typeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000001", optional: false, setoftype: false, variadic: false }], returnTypeId: "a6f5468c-c2a6-5852-8f73-57484b1c6831" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::array_insert",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function array_join(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::array_join", args, spec, [
    { args: [{ typeId: "bb221d39-09f1-507e-8851-62075bb61823", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "48aa45ef-4d93-5fbd-bfb5-81bf67b49eab", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::array_join",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bytes_get_bit(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bytes_get_bit", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bytes_get_bit",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function datetime_current(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::datetime_current", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-00000000010a" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::datetime_current",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function datetime_of_transaction(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::datetime_of_transaction", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-00000000010a" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::datetime_of_transaction",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function datetime_of_statement(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::datetime_of_statement", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-00000000010a" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::datetime_of_statement",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function datetime_get(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::datetime_get", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::datetime_get",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function datetime_truncate(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::datetime_truncate", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::datetime_truncate",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_pad_start(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_pad_start", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_pad_start",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_lpad(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_lpad", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_lpad",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function duration_get(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::duration_get", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::duration_get",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function duration_truncate(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::duration_truncate", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010e" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000112" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000111" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::duration_truncate",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function duration_to_seconds(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::duration_to_seconds", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::duration_to_seconds",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function json_typeof(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::json_typeof", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::json_typeof",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function json_array_unpack(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::json_array_unpack", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010f", returnTypemod: "SetOfType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::json_array_unpack",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function json_object_unpack(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::json_object_unpack", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }], returnTypeId: "416fe1a6-d62c-5481-80cd-2102a37b3415", returnTypemod: "SetOfType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::json_object_unpack",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function json_object_pack(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::json_object_pack", args, spec, [
    { args: [{ typeId: "416fe1a6-d62c-5481-80cd-2102a37b3415", optional: false, setoftype: true, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010f" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::json_object_pack",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function json_get(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::json_get", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: true }], namedArgs: { "default": { typeId: "00000000-0000-0000-0000-00000000010f", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-00000000010f", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::json_get",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function json_set(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::json_set", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: true }], namedArgs: { "value": { typeId: "00000000-0000-0000-0000-00000000010f", optional: true, setoftype: false, variadic: false }, "create_if_missing": { typeId: "00000000-0000-0000-0000-000000000109", optional: true, setoftype: false, variadic: false }, "empty_treatment": { typeId: "584feb89-c83d-561d-aa78-24e6d779f044", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-00000000010f", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::json_set",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function re_match(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::re_match", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "bb221d39-09f1-507e-8851-62075bb61823" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::re_match",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function re_match_all(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::re_match_all", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "bb221d39-09f1-507e-8851-62075bb61823", returnTypemod: "SetOfType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::re_match_all",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function re_test(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::re_test", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::re_test",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function re_replace(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::re_replace", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], namedArgs: { "flags": { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::re_replace",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_repeat(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_repeat", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_repeat",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_lower(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_lower", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_lower",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_upper(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_upper", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_upper",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_title(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_title", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_title",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_pad_end(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_pad_end", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_pad_end",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_rpad(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_rpad", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_rpad",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_trim_start(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_trim_start", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_trim_start",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_ltrim(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_ltrim", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_ltrim",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_trim_end(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_trim_end", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_trim_end",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_rtrim(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_rtrim", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_rtrim",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_trim(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_trim", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_trim",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_split(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_split", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "bb221d39-09f1-507e-8851-62075bb61823" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_split",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_replace(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_replace", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_replace",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function str_reverse(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::str_reverse", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::str_reverse",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function uuid_generate_v1mc(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::uuid_generate_v1mc", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-000000000100" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::uuid_generate_v1mc",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function uuid_generate_v4(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::uuid_generate_v4", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-000000000100" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::uuid_generate_v4",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const range = range$1;
function multirange(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::multirange", args, spec, [
    { args: [{ typeId: "3ed001c4-98e8-53a8-b2d1-0cad168d926c", optional: false, setoftype: false, variadic: false }], returnTypeId: "c3231f27-c8a1-5a0c-9830-c71206020eac" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::multirange",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function range_is_empty(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::range_is_empty", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::range_is_empty",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function range_unpack(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::range_unpack", args, spec, [
    { args: [{ typeId: "38b58945-dfd2-572c-bf7e-8cadf204a2ec", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff", returnTypemod: "SetOfType" },
    { args: [{ typeId: "356c02b7-20fa-5d27-90fc-aa628dd37c5e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff", returnTypemod: "SetOfType" },
    { args: [{ typeId: "c38cc584-72e2-5b3d-a9cc-e8e256c2dd0d", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c", returnTypemod: "SetOfType" },
    { args: [{ typeId: "38b58945-dfd2-572c-bf7e-8cadf204a2ec", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff", returnTypemod: "SetOfType" },
    { args: [{ typeId: "356c02b7-20fa-5d27-90fc-aa628dd37c5e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff", returnTypemod: "SetOfType" },
    { args: [{ typeId: "ef0fdfe1-43f9-5954-b804-56e9b7015ffc", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff", returnTypemod: "SetOfType" },
    { args: [{ typeId: "b2f8ab6d-ebca-517d-9f16-086423c5bb9c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff", returnTypemod: "SetOfType" },
    { args: [{ typeId: "10674aaf-8d88-5593-abe9-f7d82be5162b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a", returnTypemod: "SetOfType" },
    { args: [{ typeId: "c38cc584-72e2-5b3d-a9cc-e8e256c2dd0d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000112", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010c", returnTypemod: "SetOfType" },
    { args: [{ typeId: "c61dd200-697a-5b70-9ff0-6c623a700c14", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108", returnTypemod: "SetOfType" },
    { args: [{ typeId: "44825479-8abf-55f6-93bf-572798ec8f12", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010b", returnTypemod: "SetOfType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::range_unpack",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function range_get_upper(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::range_get_upper", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "581b0325-a044-58d4-aa37-3a85ea671313", returnTypemod: "OptionalType" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "581b0325-a044-58d4-aa37-3a85ea671313", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::range_get_upper",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function range_get_lower(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::range_get_lower", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "581b0325-a044-58d4-aa37-3a85ea671313", returnTypemod: "OptionalType" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "581b0325-a044-58d4-aa37-3a85ea671313", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::range_get_lower",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function range_is_inclusive_upper(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::range_is_inclusive_upper", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::range_is_inclusive_upper",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function range_is_inclusive_lower(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::range_is_inclusive_lower", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::range_is_inclusive_lower",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function overlaps(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::overlaps", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::overlaps",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function multirange_unpack(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::multirange_unpack", args, spec, [
    { args: [{ typeId: "a36a494d-f2c1-5886-8e17-b0c8ba9337ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "38b58945-dfd2-572c-bf7e-8cadf204a2ec", returnTypemod: "SetOfType" },
    { args: [{ typeId: "da3c9da3-1b79-53d0-ae36-82026533939b", optional: false, setoftype: false, variadic: false }], returnTypeId: "356c02b7-20fa-5d27-90fc-aa628dd37c5e", returnTypemod: "SetOfType" },
    { args: [{ typeId: "18b39277-efe3-582c-8bdc-b18f4ed46e09", optional: false, setoftype: false, variadic: false }], returnTypeId: "ef0fdfe1-43f9-5954-b804-56e9b7015ffc", returnTypemod: "SetOfType" },
    { args: [{ typeId: "75f5b5c7-f201-56a8-9fd0-bd139e69fdbe", optional: false, setoftype: false, variadic: false }], returnTypeId: "b2f8ab6d-ebca-517d-9f16-086423c5bb9c", returnTypemod: "SetOfType" },
    { args: [{ typeId: "80da35c5-4ed6-5799-8eea-1c5923a3f8d3", optional: false, setoftype: false, variadic: false }], returnTypeId: "c61dd200-697a-5b70-9ff0-6c623a700c14", returnTypemod: "SetOfType" },
    { args: [{ typeId: "58da8bd4-709a-50bc-b0b4-a1918b7dc2ba", optional: false, setoftype: false, variadic: false }], returnTypeId: "10674aaf-8d88-5593-abe9-f7d82be5162b", returnTypemod: "SetOfType" },
    { args: [{ typeId: "37c39ed3-114c-5835-b662-80d80db0199d", optional: false, setoftype: false, variadic: false }], returnTypeId: "44825479-8abf-55f6-93bf-572798ec8f12", returnTypemod: "SetOfType" },
    { args: [{ typeId: "74568c88-a8c3-5a02-9acd-64616d07ab8b", optional: false, setoftype: false, variadic: false }], returnTypeId: "c38cc584-72e2-5b3d-a9cc-e8e256c2dd0d", returnTypemod: "SetOfType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::multirange_unpack",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function strictly_below(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::strictly_below", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::strictly_below",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function strictly_above(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::strictly_above", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::strictly_above",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bounded_above(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bounded_above", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bounded_above",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function bounded_below(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::bounded_below", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::bounded_below",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function adjacent(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::adjacent", args, spec, [
    { args: [{ typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }, { typeId: "49748e47-8d91-5269-9a34-2e8ca194e0f2", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" },
    { args: [{ typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }, { typeId: "c3231f27-c8a1-5a0c-9830-c71206020eac", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::adjacent",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_str(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_str", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010a", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000110", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "bb221d39-09f1-507e-8851-62075bb61823", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010f", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010c", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010d", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000111", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_str",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_bytes(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_bytes", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000100", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" },
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "e4a1d11b-227e-5744-a0c9-31f9cd756e7b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_bytes",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_json(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_json", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010f" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_json",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_datetime(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_datetime", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" },
    { args: [{ typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000108", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" },
    { args: [{ typeId: "00000000-0000-0000-0000-00000000010b", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010a" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_datetime",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_duration(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_duration", args, spec, [
    { args: [], namedArgs: { "hours": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "minutes": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "seconds": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false }, "microseconds": { typeId: "00000000-0000-0000-0000-0000000001ff", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-00000000010e" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_duration",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_bigint(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_bigint", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000110" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_bigint",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_decimal(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_decimal", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000108" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_decimal",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_int64(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_int64", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "e4a1d11b-227e-5744-a0c9-31f9cd756e7b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_int64",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_int32(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_int32", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "e4a1d11b-227e-5744-a0c9-31f9cd756e7b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_int32",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_int16(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_int16", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "e4a1d11b-227e-5744-a0c9-31f9cd756e7b", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_int16",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_float64(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_float64", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_float64",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_float32(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_float32", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_float32",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function to_uuid(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::to_uuid", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000100" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::to_uuid",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function sequence_reset(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::sequence_reset", args, spec, [
    { args: [{ typeId: "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" },
    { args: [{ typeId: "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::sequence_reset",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function sequence_next(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("std::sequence_next", args, spec, [
    { args: [{ typeId: "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-0000000001ff" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "std::sequence_next",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports$7 = {
  "Endian": Endian,
  "JsonEmpty": JsonEmpty,
  "bigint": bigint,
  "bool": bool,
  "bytes": bytes,
  "datetime": datetime,
  "decimal": decimal,
  "duration": duration,
  "float32": float32,
  "float64": float64,
  "int16": int16,
  "int32": int32,
  "int64": int64,
  "json": json,
  "str": str,
  "uuid": uuid,
  "BaseObject": BaseObject,
  "Object": Object_8ce8c71ee4fa5f73840c22d7eaa58588,
  "FreeObject": FreeObject,
  "assert_single": assert_single,
  "assert_exists": assert_exists,
  "assert_distinct": assert_distinct,
  "assert": assert,
  "materialized": materialized,
  "len": len,
  "sum": sum,
  "count": count,
  "random": random,
  "min": min,
  "max": max,
  "all": all,
  "any": any,
  "enumerate": enumerate,
  "round": round,
  "contains": contains,
  "array_fill": array_fill,
  "find": find,
  "bit_and": bit_and,
  "bit_or": bit_or,
  "bit_xor": bit_xor,
  "bit_not": bit_not,
  "bit_rshift": bit_rshift,
  "bit_lshift": bit_lshift,
  "bit_count": bit_count,
  "array_agg": array_agg,
  "array_unpack": array_unpack,
  "array_replace": array_replace,
  "array_get": array_get,
  "array_set": array_set,
  "array_insert": array_insert,
  "array_join": array_join,
  "bytes_get_bit": bytes_get_bit,
  "datetime_current": datetime_current,
  "datetime_of_transaction": datetime_of_transaction,
  "datetime_of_statement": datetime_of_statement,
  "datetime_get": datetime_get,
  "datetime_truncate": datetime_truncate,
  "str_pad_start": str_pad_start,
  "str_lpad": str_lpad,
  "duration_get": duration_get,
  "duration_truncate": duration_truncate,
  "duration_to_seconds": duration_to_seconds,
  "json_typeof": json_typeof,
  "json_array_unpack": json_array_unpack,
  "json_object_unpack": json_object_unpack,
  "json_object_pack": json_object_pack,
  "json_get": json_get,
  "json_set": json_set,
  "re_match": re_match,
  "re_match_all": re_match_all,
  "re_test": re_test,
  "re_replace": re_replace,
  "str_repeat": str_repeat,
  "str_lower": str_lower,
  "str_upper": str_upper,
  "str_title": str_title,
  "str_pad_end": str_pad_end,
  "str_rpad": str_rpad,
  "str_trim_start": str_trim_start,
  "str_ltrim": str_ltrim,
  "str_trim_end": str_trim_end,
  "str_rtrim": str_rtrim,
  "str_trim": str_trim,
  "str_split": str_split,
  "str_replace": str_replace,
  "str_reverse": str_reverse,
  "uuid_generate_v1mc": uuid_generate_v1mc,
  "uuid_generate_v4": uuid_generate_v4,
  "range": range,
  "multirange": multirange,
  "range_is_empty": range_is_empty,
  "range_unpack": range_unpack,
  "range_get_upper": range_get_upper,
  "range_get_lower": range_get_lower,
  "range_is_inclusive_upper": range_is_inclusive_upper,
  "range_is_inclusive_lower": range_is_inclusive_lower,
  "overlaps": overlaps,
  "multirange_unpack": multirange_unpack,
  "strictly_below": strictly_below,
  "strictly_above": strictly_above,
  "bounded_above": bounded_above,
  "bounded_below": bounded_below,
  "adjacent": adjacent,
  "to_str": to_str,
  "to_bytes": to_bytes,
  "to_json": to_json,
  "to_datetime": to_datetime,
  "to_duration": to_duration,
  "to_bigint": to_bigint,
  "to_decimal": to_decimal,
  "to_int64": to_int64,
  "to_int32": to_int32,
  "to_int16": to_int16,
  "to_float64": to_float64,
  "to_float32": to_float32,
  "to_uuid": to_uuid,
  "sequence_reset": sequence_reset,
  "sequence_next": sequence_next,
  "cal": __defaultExports$e,
  "enc": __defaultExports$d,
  "fts": __defaultExports$c,
  "net": __defaultExports$a,
  "pg": __defaultExports$9,
  "math": __defaultExports$8
};
const AllowBareDDL = makeType(spec, "50264e27-859e-5d2b-a589-ebb3d8ba4d8c", literal);
const ConnectionTransport = makeType(spec, "1adbf789-39c3-5070-bc17-776f94d59e46", literal);
const QueryCacheMode = makeType(spec, "7cb23cda-17b8-575c-9561-05e2e9351897", literal);
const QueryStatsOption = makeType(spec, "258dbe3b-cb49-5713-b9fb-b220c8065c01", literal);
const SMTPSecurity = makeType(spec, "6dc9f7f4-5b6b-5afc-9e5e-57a6b2f15cbc", literal);
const StoreMigrationSDL = makeType(spec, "43ce9f9e-00cd-5303-a1b3-fea515a046d8", literal);
const memory = makeType(spec, "00000000-0000-0000-0000-000000000130", literal);
const $ConfigObject = makeType(spec, "d408002f-3891-5b9a-b19c-23589a88998b", literal);
const ConfigObject = PathNode($toSet($ConfigObject, Cardinality$1.Many), null);
const $AbstractConfig = makeType(spec, "8b66e734-a01e-5638-a812-359e0d005a37", literal);
const AbstractConfig = PathNode($toSet($AbstractConfig, Cardinality$1.Many), null);
const $Auth = makeType(spec, "a2ba7516-d398-5ec2-b25e-221b2f7b9e87", literal);
const Auth = PathNode($toSet($Auth, Cardinality$1.Many), null);
const $AuthMethod = makeType(spec, "128fcc80-bf32-5bdc-abac-09cf1532a7c1", literal);
const AuthMethod = PathNode($toSet($AuthMethod, Cardinality$1.Many), null);
const $DatabaseConfig = makeType(spec, "c046988e-25f8-55b8-8d94-9e2a13d7625f", literal);
const DatabaseConfig = PathNode($toSet($DatabaseConfig, Cardinality$1.Many), null);
const $BranchConfig = makeType(spec, "b8b6fefa-f0c7-5eea-9f2f-98a5222c7c5e", literal);
const BranchConfig = PathNode($toSet($BranchConfig, Cardinality$1.Many), null);
const $Config = makeType(spec, "363133b1-e993-50a0-94d3-aa0472b1a0a7", literal);
const Config = PathNode($toSet($Config, Cardinality$1.Many), null);
const $EmailProviderConfig = makeType(spec, "0caa4e7a-7c52-5cff-aee4-920ede8a569c", literal);
const EmailProviderConfig = PathNode($toSet($EmailProviderConfig, Cardinality$1.Many), null);
const $ExtensionConfig = makeType(spec, "89fb9b8b-d3b2-5075-9d1a-f5b116a0f188", literal);
const ExtensionConfig = PathNode($toSet($ExtensionConfig, Cardinality$1.Many), null);
const $InstanceConfig = makeType(spec, "d9e9f342-7992-544c-b6af-459302121188", literal);
const InstanceConfig = PathNode($toSet($InstanceConfig, Cardinality$1.Many), null);
const $JWT = makeType(spec, "4e795376-37e8-5381-8ae4-d621c80bbc7b", literal);
const JWT = PathNode($toSet($JWT, Cardinality$1.Many), null);
const $Password = makeType(spec, "9df8c566-c274-5d75-a948-2d901505d7de", literal);
const Password = PathNode($toSet($Password, Cardinality$1.Many), null);
const $SCRAM = makeType(spec, "ca43bc46-6dd2-55fc-98dc-358978df0f24", literal);
const SCRAM = PathNode($toSet($SCRAM, Cardinality$1.Many), null);
const $SMTPProviderConfig = makeType(spec, "519a3483-0198-576f-932d-508587433ec7", literal);
const SMTPProviderConfig = PathNode($toSet($SMTPProviderConfig, Cardinality$1.Many), null);
const $Trust = makeType(spec, "7fc09ace-4af4-5d90-a9ab-94f9bb4cdb42", literal);
const Trust = PathNode($toSet($Trust, Cardinality$1.Many), null);
const $mTLS = makeType(spec, "e96db572-9980-5ce1-8049-1561b3980d0e", literal);
const mTLS = PathNode($toSet($mTLS, Cardinality$1.Many), null);
function get_config_json(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("cfg::get_config_json", args, spec, [
    { args: [], namedArgs: { "sources": { typeId: "bb221d39-09f1-507e-8851-62075bb61823", optional: true, setoftype: false, variadic: false }, "max_source": { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-00000000010f" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "cfg::get_config_json",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports$6 = {
  "AllowBareDDL": AllowBareDDL,
  "ConnectionTransport": ConnectionTransport,
  "QueryCacheMode": QueryCacheMode,
  "QueryStatsOption": QueryStatsOption,
  "SMTPSecurity": SMTPSecurity,
  "StoreMigrationSDL": StoreMigrationSDL,
  "memory": memory,
  "ConfigObject": ConfigObject,
  "AbstractConfig": AbstractConfig,
  "Auth": Auth,
  "AuthMethod": AuthMethod,
  "DatabaseConfig": DatabaseConfig,
  "BranchConfig": BranchConfig,
  "Config": Config,
  "EmailProviderConfig": EmailProviderConfig,
  "ExtensionConfig": ExtensionConfig,
  "InstanceConfig": InstanceConfig,
  "JWT": JWT,
  "Password": Password,
  "SCRAM": SCRAM,
  "SMTPProviderConfig": SMTPProviderConfig,
  "Trust": Trust,
  "mTLS": mTLS,
  "get_config_json": get_config_json
};
const AccountType = makeType(spec, "80e102ff-f70a-11ef-9f4b-6311814e8a37", literal);
const CurrencyType = makeType(spec, "f2153688-fd1b-11ef-9169-c92219e550e3", literal);
const EntryType = makeType(spec, "80e11b72-f70a-11ef-a93d-c18632c5b734", literal);
const $Currency = makeType(spec, "8a26e1fc-f70a-11ef-8721-ddb397e10907", literal);
const Currency = PathNode($toSet($Currency, Cardinality$1.Many), null);
const $Entry = makeType(spec, "80e136a6-f70a-11ef-b675-37ad4fedecc7", literal);
const Entry = PathNode($toSet($Entry, Cardinality$1.Many), null);
const $Invitation = makeType(spec, "80e6e04a-f70a-11ef-be78-e1dc35b13d52", literal);
const Invitation = PathNode($toSet($Invitation, Cardinality$1.Many), null);
const $User = makeType(spec, "80e32bd5-f70a-11ef-94d7-43ff6af0567f", literal);
const User = PathNode($toSet($User, Cardinality$1.Many), null);
const __defaultExports$5 = {
  "AccountType": AccountType,
  "CurrencyType": CurrencyType,
  "EntryType": EntryType,
  "Currency": Currency,
  "Entry": Entry,
  "Invitation": Invitation,
  "User": User
};
const FlowType = makeType(spec, "f1f61c43-08ca-5ae0-870d-ace07304ca8f", literal);
const JWTAlgo = makeType(spec, "14113b4e-86a8-5b08-8ee9-9cfc1c7dc1e8", literal);
const WebhookEvent = makeType(spec, "8ca59fbe-2a6d-5fde-b746-99bc372de3d5", literal);
const $ProviderConfig = makeType(spec, "594f22fc-bbb1-5588-b7d1-ed498df6ccec", literal);
const ProviderConfig = PathNode($toSet($ProviderConfig, Cardinality$1.Many), null);
const $OAuthProviderConfig = makeType(spec, "848d522a-6d9c-5317-b807-7e9b926f0a66", literal);
const OAuthProviderConfig = PathNode($toSet($OAuthProviderConfig, Cardinality$1.Many), null);
const $AppleOAuthProvider = makeType(spec, "2059ae30-cb44-51d0-b016-920ef0a691b4", literal);
const AppleOAuthProvider = PathNode($toSet($AppleOAuthProvider, Cardinality$1.Many), null);
const $Auditable = makeType(spec, "4315a540-bc94-58fa-8e95-a5816e134135", literal);
const Auditable = PathNode($toSet($Auditable, Cardinality$1.Many), null);
const $AuthConfig = makeType(spec, "3e1bc003-0fc3-5ff8-9064-26627924dca5", literal);
const AuthConfig = PathNode($toSet($AuthConfig, Cardinality$1.Many), null);
const $AzureOAuthProvider = makeType(spec, "8e5252c0-063b-5112-8228-ec339ac035a7", literal);
const AzureOAuthProvider = PathNode($toSet($AzureOAuthProvider, Cardinality$1.Many), null);
const $Identity = makeType(spec, "6801b916-bb3e-57eb-a156-c53c7623c210", literal);
const Identity = PathNode($toSet($Identity, Cardinality$1.Many), null);
const $ClientTokenIdentity = makeType(spec, "7b736e73-4ce5-5dbe-a4a7-d0b278be5ec8", literal);
const ClientTokenIdentity = PathNode($toSet($ClientTokenIdentity, Cardinality$1.Many), null);
const $DiscordOAuthProvider = makeType(spec, "1211be9e-fb63-560a-be54-e82f7520fc35", literal);
const DiscordOAuthProvider = PathNode($toSet($DiscordOAuthProvider, Cardinality$1.Many), null);
const $Factor = makeType(spec, "5a4c113f-3892-5708-bf83-696857e64305", literal);
const Factor = PathNode($toSet($Factor, Cardinality$1.Many), null);
const $EmailFactor = makeType(spec, "c8e5d5f3-fced-5e92-a040-af0ef7991888", literal);
const EmailFactor = PathNode($toSet($EmailFactor, Cardinality$1.Many), null);
const $EmailPasswordFactor = makeType(spec, "177397b5-4749-5b76-8062-813313551a8f", literal);
const EmailPasswordFactor = PathNode($toSet($EmailPasswordFactor, Cardinality$1.Many), null);
const $EmailPasswordProviderConfig = makeType(spec, "f58a65af-0293-5623-87f9-3e79d77665b7", literal);
const EmailPasswordProviderConfig = PathNode($toSet($EmailPasswordProviderConfig, Cardinality$1.Many), null);
const $GitHubOAuthProvider = makeType(spec, "65ca9461-dbf9-5c42-8dd8-8e13e6bad184", literal);
const GitHubOAuthProvider = PathNode($toSet($GitHubOAuthProvider, Cardinality$1.Many), null);
const $GoogleOAuthProvider = makeType(spec, "ec577bc3-ecb3-5446-96ca-3842d9183f2f", literal);
const GoogleOAuthProvider = PathNode($toSet($GoogleOAuthProvider, Cardinality$1.Many), null);
const $LocalIdentity = makeType(spec, "78ff164d-0c30-56a8-8baa-73824f6d68c6", literal);
const LocalIdentity = PathNode($toSet($LocalIdentity, Cardinality$1.Many), null);
const $MagicLinkFactor = makeType(spec, "2e73616f-1385-54a2-9105-0381fedd24c6", literal);
const MagicLinkFactor = PathNode($toSet($MagicLinkFactor, Cardinality$1.Many), null);
const $MagicLinkProviderConfig = makeType(spec, "94669beb-b17f-5923-b1ce-42cdbaba861b", literal);
const MagicLinkProviderConfig = PathNode($toSet($MagicLinkProviderConfig, Cardinality$1.Many), null);
const $OpenIDConnectProvider = makeType(spec, "c884e7ba-db13-5017-bbfa-0de47a844d91", literal);
const OpenIDConnectProvider = PathNode($toSet($OpenIDConnectProvider, Cardinality$1.Many), null);
const $PKCEChallenge = makeType(spec, "559cb828-957b-5cfc-bddb-f74adc5c71be", literal);
const PKCEChallenge = PathNode($toSet($PKCEChallenge, Cardinality$1.Many), null);
const $SlackOAuthProvider = makeType(spec, "9952c73b-751a-59ae-b367-753d9e9ee215", literal);
const SlackOAuthProvider = PathNode($toSet($SlackOAuthProvider, Cardinality$1.Many), null);
const $UIConfig = makeType(spec, "594c2313-d943-51c0-a6bb-d9d367926838", literal);
const UIConfig = PathNode($toSet($UIConfig, Cardinality$1.Many), null);
const $WebAuthnAuthenticationChallenge = makeType(spec, "ffb4afce-f9e9-5494-83e4-d9ab262ad48e", literal);
const WebAuthnAuthenticationChallenge = PathNode($toSet($WebAuthnAuthenticationChallenge, Cardinality$1.Many), null);
const $WebAuthnFactor = makeType(spec, "565eca61-74f2-562e-ab89-733402d7ed0f", literal);
const WebAuthnFactor = PathNode($toSet($WebAuthnFactor, Cardinality$1.Many), null);
const $WebAuthnProviderConfig = makeType(spec, "0e105468-3e50-5c03-881d-4c2446b93ee1", literal);
const WebAuthnProviderConfig = PathNode($toSet($WebAuthnProviderConfig, Cardinality$1.Many), null);
const $WebAuthnRegistrationChallenge = makeType(spec, "e6627c40-57e9-5dc8-9612-7d983ec18e2a", literal);
const WebAuthnRegistrationChallenge = PathNode($toSet($WebAuthnRegistrationChallenge, Cardinality$1.Many), null);
const $WebhookConfig = makeType(spec, "e7891c5d-ac77-5e4b-bf98-3585ad63c382", literal);
const WebhookConfig = PathNode($toSet($WebhookConfig, Cardinality$1.Many), null);
function webhook_signing_key_exists(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::auth::webhook_signing_key_exists", args, spec, [
    { args: [{ typeId: "e7891c5d-ac77-5e4b-bf98-3585ad63c382", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::auth::webhook_signing_key_exists",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function signing_key_exists(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::auth::signing_key_exists", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-000000000109" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::auth::signing_key_exists",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function jwt_check_signature_afb44ddf133051a39d0871812371dd10(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::auth::_jwt_check_signature", args, spec, [
    { args: [{ typeId: "7bfb0106-9442-58d3-9fe3-3c204e331351", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "14113b4e-86a8-5b08-8ee9-9cfc1c7dc1e8", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010f" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::auth::_jwt_check_signature",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function jwt_parse_08a86a788cea56a9b555b4a881b5e569(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::auth::_jwt_parse", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "7bfb0106-9442-58d3-9fe3-3c204e331351" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::auth::_jwt_parse",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function jwt_verify_75faa5ad758d5502bb04da9b92b99f58(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::auth::_jwt_verify", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "14113b4e-86a8-5b08-8ee9-9cfc1c7dc1e8", optional: true, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-00000000010f" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::auth::_jwt_verify",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const $ext_auth__globals = { ClientTokenIdentity: makeGlobal(
  "ext::auth::ClientTokenIdentity",
  makeType(spec, "7b736e73-4ce5-5dbe-a4a7-d0b278be5ec8", literal),
  Cardinality$1.AtMostOne
), client_token: makeGlobal(
  "ext::auth::client_token",
  makeType(spec, "00000000-0000-0000-0000-000000000101", literal),
  Cardinality$1.AtMostOne
) };
const __defaultExports$4 = {
  "FlowType": FlowType,
  "JWTAlgo": JWTAlgo,
  "WebhookEvent": WebhookEvent,
  "ProviderConfig": ProviderConfig,
  "OAuthProviderConfig": OAuthProviderConfig,
  "AppleOAuthProvider": AppleOAuthProvider,
  "Auditable": Auditable,
  "AuthConfig": AuthConfig,
  "AzureOAuthProvider": AzureOAuthProvider,
  "Identity": Identity,
  "ClientTokenIdentity": ClientTokenIdentity,
  "DiscordOAuthProvider": DiscordOAuthProvider,
  "Factor": Factor,
  "EmailFactor": EmailFactor,
  "EmailPasswordFactor": EmailPasswordFactor,
  "EmailPasswordProviderConfig": EmailPasswordProviderConfig,
  "GitHubOAuthProvider": GitHubOAuthProvider,
  "GoogleOAuthProvider": GoogleOAuthProvider,
  "LocalIdentity": LocalIdentity,
  "MagicLinkFactor": MagicLinkFactor,
  "MagicLinkProviderConfig": MagicLinkProviderConfig,
  "OpenIDConnectProvider": OpenIDConnectProvider,
  "PKCEChallenge": PKCEChallenge,
  "SlackOAuthProvider": SlackOAuthProvider,
  "UIConfig": UIConfig,
  "WebAuthnAuthenticationChallenge": WebAuthnAuthenticationChallenge,
  "WebAuthnFactor": WebAuthnFactor,
  "WebAuthnProviderConfig": WebAuthnProviderConfig,
  "WebAuthnRegistrationChallenge": WebAuthnRegistrationChallenge,
  "WebhookConfig": WebhookConfig,
  "webhook_signing_key_exists": webhook_signing_key_exists,
  "signing_key_exists": signing_key_exists,
  "_jwt_check_signature": jwt_check_signature_afb44ddf133051a39d0871812371dd10,
  "_jwt_parse": jwt_parse_08a86a788cea56a9b555b4a881b5e569,
  "_jwt_verify": jwt_verify_75faa5ad758d5502bb04da9b92b99f58,
  "global": $ext_auth__globals
};
function digest(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::pgcrypto::digest", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::pgcrypto::digest",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function hmac(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::pgcrypto::hmac", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000102", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000102" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::pgcrypto::hmac",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function gen_salt(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::pgcrypto::gen_salt", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" },
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-0000000001ff", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::pgcrypto::gen_salt",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function crypt(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("ext::pgcrypto::crypt", args, spec, [
    { args: [{ typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }, { typeId: "00000000-0000-0000-0000-000000000101", optional: false, setoftype: false, variadic: false }], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "ext::pgcrypto::crypt",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports$3 = {
  "digest": digest,
  "hmac": hmac,
  "gen_salt": gen_salt,
  "crypt": crypt
};
const __defaultExports$2 = {
  "auth": __defaultExports$4,
  "pgcrypto": __defaultExports$3
};
const AccessKind = makeType(spec, "998b88fc-083a-584b-85bb-372ade248f66", literal);
const AccessPolicyAction = makeType(spec, "d8c466cc-109e-587c-aff8-42e50705b5b0", literal);
const Cardinality = makeType(spec, "94abc2f6-2e3e-55fc-8e97-b44ba70a3950", literal);
const IndexDeferrability = makeType(spec, "b31b2d9a-681c-5709-bec5-321897ea5bd6", literal);
const MigrationGeneratedBy = makeType(spec, "8fcfde20-139b-5c17-93b9-9a49512b83dc", literal);
const OperatorKind = makeType(spec, "e48403f0-7017-5bf5-ab92-22825d9f1090", literal);
const ParameterKind = makeType(spec, "8037d84a-de95-5e63-ab76-727112419261", literal);
const RewriteKind = makeType(spec, "a06f04aa-88b7-5d9a-b520-b8139fd64d0c", literal);
const SourceDeleteAction = makeType(spec, "1c938388-8739-57a7-8095-cc173226ad8e", literal);
const TargetDeleteAction = makeType(spec, "6b925c92-5e48-5e6d-96f2-4125d9119b66", literal);
const TriggerKind = makeType(spec, "3c6fa29f-8481-59c9-a9bf-ac30ab50be32", literal);
const TriggerScope = makeType(spec, "20998fe7-4392-5673-96b5-5f1cd736b5df", literal);
const TriggerTiming = makeType(spec, "a2c7e6ae-370c-53a7-842c-21e238faf3ee", literal);
const TypeModifier = makeType(spec, "67722d75-1145-54b6-af26-94602de09d51", literal);
const Volatility = makeType(spec, "de5b90f2-6e49-5543-991b-28a156c7867f", literal);
const $Object_32faaa35947553cf88fce68ecf1be4d9 = makeType(spec, "32faaa35-9475-53cf-88fc-e68ecf1be4d9", literal);
const Object_32faaa35947553cf88fce68ecf1be4d9 = PathNode($toSet($Object_32faaa35947553cf88fce68ecf1be4d9, Cardinality$1.Many), null);
const $SubclassableObject = makeType(spec, "145b7b6f-8fa4-5b14-bcd3-5d6d10dc25da", literal);
const SubclassableObject = PathNode($toSet($SubclassableObject, Cardinality$1.Many), null);
const $InheritingObject = makeType(spec, "825a1378-6b30-5f15-82f1-1c92e57691f2", literal);
const InheritingObject = PathNode($toSet($InheritingObject, Cardinality$1.Many), null);
const $AnnotationSubject = makeType(spec, "970b2d83-85d8-5a46-a4e8-337d28abc12e", literal);
const AnnotationSubject = PathNode($toSet($AnnotationSubject, Cardinality$1.Many), null);
const $AccessPolicy = makeType(spec, "a8462073-0539-5640-9d9d-2db251c0b350", literal);
const AccessPolicy = PathNode($toSet($AccessPolicy, Cardinality$1.Many), null);
const $Alias = makeType(spec, "4388400b-e01d-582c-b1da-8161814835a6", literal);
const Alias = PathNode($toSet($Alias, Cardinality$1.Many), null);
const $Annotation = makeType(spec, "273b8735-318f-53f6-9297-6f20162c9105", literal);
const Annotation = PathNode($toSet($Annotation, Cardinality$1.Many), null);
const $Type = makeType(spec, "8e652319-e551-5b5c-a7bd-9591f0ef5303", literal);
const Type = PathNode($toSet($Type, Cardinality$1.Many), null);
const $PrimitiveType = makeType(spec, "da26fa09-3541-5cba-b93f-d5ba58d25589", literal);
const PrimitiveType = PathNode($toSet($PrimitiveType, Cardinality$1.Many), null);
const $CollectionType = makeType(spec, "e3a7ccf7-4a20-5151-80b3-5156c9373889", literal);
const CollectionType = PathNode($toSet($CollectionType, Cardinality$1.Many), null);
const $Array = makeType(spec, "283cc7a9-7bf6-5eda-a323-b4e5173f2927", literal);
const Array$1 = PathNode($toSet($Array, Cardinality$1.Many), null);
const $ArrayExprAlias = makeType(spec, "2e55d7f5-18ed-54b4-ade0-ba404dd482d3", literal);
const ArrayExprAlias = PathNode($toSet($ArrayExprAlias, Cardinality$1.Many), null);
const $CallableObject = makeType(spec, "800f2df9-dd86-5681-9e3c-b529af481a9d", literal);
const CallableObject = PathNode($toSet($CallableObject, Cardinality$1.Many), null);
const $VolatilitySubject = makeType(spec, "ed8e20ca-f2dc-5626-bccb-05ef9ed65791", literal);
const VolatilitySubject = PathNode($toSet($VolatilitySubject, Cardinality$1.Many), null);
const $Cast = makeType(spec, "2b25c5a4-5ad4-5c4b-b545-574ccac3fd7f", literal);
const Cast = PathNode($toSet($Cast, Cardinality$1.Many), null);
const $ConsistencySubject = makeType(spec, "883ec593-7428-5707-af16-d446e5d8ed28", literal);
const ConsistencySubject = PathNode($toSet($ConsistencySubject, Cardinality$1.Many), null);
const $Constraint = makeType(spec, "9346c403-6ee6-50b6-81b2-a35551cfab2f", literal);
const Constraint = PathNode($toSet($Constraint, Cardinality$1.Many), null);
const $Delta = makeType(spec, "c974be74-46d8-5848-b2a9-be5eda14f73e", literal);
const Delta = PathNode($toSet($Delta, Cardinality$1.Many), null);
const $Extension = makeType(spec, "b9c53751-8d28-5077-b1db-a03ea59557ed", literal);
const Extension = PathNode($toSet($Extension, Cardinality$1.Many), null);
const $Function = makeType(spec, "3a60f555-7c03-5287-b4c9-f078692a89ef", literal);
const Function = PathNode($toSet($Function, Cardinality$1.Many), null);
const $FutureBehavior = makeType(spec, "003feed0-dc7d-564e-abb5-93a42ba99d64", literal);
const FutureBehavior = PathNode($toSet($FutureBehavior, Cardinality$1.Many), null);
const $Global = makeType(spec, "e1294378-bb3d-57e0-81d2-6a19ea088231", literal);
const Global = PathNode($toSet($Global, Cardinality$1.Many), null);
const $Index = makeType(spec, "decfa7fb-1f66-5986-be86-fc9b6c268a97", literal);
const Index = PathNode($toSet($Index, Cardinality$1.Many), null);
const $Pointer = makeType(spec, "57e1c6b1-ce76-5b5b-943f-f01f1e6a16a3", literal);
const Pointer = PathNode($toSet($Pointer, Cardinality$1.Many), null);
const $Source = makeType(spec, "0368bb5e-ae06-5c00-9316-15095185b828", literal);
const Source = PathNode($toSet($Source, Cardinality$1.Many), null);
const $Link = makeType(spec, "98fe77cc-128e-58fe-b87a-1251c3288548", literal);
const Link = PathNode($toSet($Link, Cardinality$1.Many), null);
const $Migration = makeType(spec, "31f74b3a-d9b1-5e35-a746-057f44c58e76", literal);
const Migration = PathNode($toSet($Migration, Cardinality$1.Many), null);
const $Module = makeType(spec, "7106039a-ed86-5868-8227-3e2fc5e3e5ec", literal);
const Module = PathNode($toSet($Module, Cardinality$1.Many), null);
const $MultiRange = makeType(spec, "800c4a49-db9d-5a39-9cf2-aa213b858616", literal);
const MultiRange = PathNode($toSet($MultiRange, Cardinality$1.Many), null);
const $MultiRangeExprAlias = makeType(spec, "a92ef6fd-611e-5b00-8115-cc0ebb5f0be5", literal);
const MultiRangeExprAlias = PathNode($toSet($MultiRangeExprAlias, Cardinality$1.Many), null);
const $ObjectType = makeType(spec, "2662a1b4-4f3f-5875-b6eb-ce52101a90a3", literal);
const ObjectType = PathNode($toSet($ObjectType, Cardinality$1.Many), null);
const $Operator = makeType(spec, "e37bd85e-5e2f-5daa-9dd9-d21d419032be", literal);
const Operator = PathNode($toSet($Operator, Cardinality$1.Many), null);
const $Parameter = makeType(spec, "87f7d583-3e3c-507e-9fbb-4bf3b9e5aa24", literal);
const Parameter = PathNode($toSet($Parameter, Cardinality$1.Many), null);
const $Property = makeType(spec, "a57f48ff-3bb9-5693-a2e1-bf328a2ddbfc", literal);
const Property = PathNode($toSet($Property, Cardinality$1.Many), null);
const $PseudoType = makeType(spec, "0875f8c3-7033-5cc4-af04-2b6d80e289e0", literal);
const PseudoType = PathNode($toSet($PseudoType, Cardinality$1.Many), null);
const $Range = makeType(spec, "cced31f8-8167-59d7-b269-c49ae88a0ac1", literal);
const Range = PathNode($toSet($Range, Cardinality$1.Many), null);
const $RangeExprAlias = makeType(spec, "bc63491c-2a88-5353-b5f0-6f2188a4f65d", literal);
const RangeExprAlias = PathNode($toSet($RangeExprAlias, Cardinality$1.Many), null);
const $Rewrite = makeType(spec, "d60198c8-ad58-5c4c-b3b6-d520c19f5cef", literal);
const Rewrite = PathNode($toSet($Rewrite, Cardinality$1.Many), null);
const $ScalarType = makeType(spec, "d055dd47-3eb9-5a31-9d8f-5e7053bbe11e", literal);
const ScalarType = PathNode($toSet($ScalarType, Cardinality$1.Many), null);
const $Trigger = makeType(spec, "2b738231-1ef7-59d0-a04c-dae012181a02", literal);
const Trigger = PathNode($toSet($Trigger, Cardinality$1.Many), null);
const $Tuple = makeType(spec, "d88b4a0c-9561-56f4-b0a9-7b24027b4de8", literal);
const Tuple = PathNode($toSet($Tuple, Cardinality$1.Many), null);
const $TupleElement = makeType(spec, "9cc04b0b-11e0-5670-a8a1-441a323e12fb", literal);
const TupleElement = PathNode($toSet($TupleElement, Cardinality$1.Many), null);
const $TupleExprAlias = makeType(spec, "b7744aa3-50fc-54e0-ae51-20d78737e25b", literal);
const TupleExprAlias = PathNode($toSet($TupleExprAlias, Cardinality$1.Many), null);
const __defaultExports$1 = {
  "AccessKind": AccessKind,
  "AccessPolicyAction": AccessPolicyAction,
  "Cardinality": Cardinality,
  "IndexDeferrability": IndexDeferrability,
  "MigrationGeneratedBy": MigrationGeneratedBy,
  "OperatorKind": OperatorKind,
  "ParameterKind": ParameterKind,
  "RewriteKind": RewriteKind,
  "SourceDeleteAction": SourceDeleteAction,
  "TargetDeleteAction": TargetDeleteAction,
  "TriggerKind": TriggerKind,
  "TriggerScope": TriggerScope,
  "TriggerTiming": TriggerTiming,
  "TypeModifier": TypeModifier,
  "Volatility": Volatility,
  "Object": Object_32faaa35947553cf88fce68ecf1be4d9,
  "SubclassableObject": SubclassableObject,
  "InheritingObject": InheritingObject,
  "AnnotationSubject": AnnotationSubject,
  "AccessPolicy": AccessPolicy,
  "Alias": Alias,
  "Annotation": Annotation,
  "Type": Type,
  "PrimitiveType": PrimitiveType,
  "CollectionType": CollectionType,
  "Array": Array$1,
  "ArrayExprAlias": ArrayExprAlias,
  "CallableObject": CallableObject,
  "VolatilitySubject": VolatilitySubject,
  "Cast": Cast,
  "ConsistencySubject": ConsistencySubject,
  "Constraint": Constraint,
  "Delta": Delta,
  "Extension": Extension,
  "Function": Function,
  "FutureBehavior": FutureBehavior,
  "Global": Global,
  "Index": Index,
  "Pointer": Pointer,
  "Source": Source,
  "Link": Link,
  "Migration": Migration,
  "Module": Module,
  "MultiRange": MultiRange,
  "MultiRangeExprAlias": MultiRangeExprAlias,
  "ObjectType": ObjectType,
  "Operator": Operator,
  "Parameter": Parameter,
  "Property": Property,
  "PseudoType": PseudoType,
  "Range": Range,
  "RangeExprAlias": RangeExprAlias,
  "Rewrite": Rewrite,
  "ScalarType": ScalarType,
  "Trigger": Trigger,
  "Tuple": Tuple,
  "TupleElement": TupleElement,
  "TupleExprAlias": TupleExprAlias
};
const OutputFormat = makeType(spec, "cae65a8c-a99f-5524-9872-daecdc545531", literal);
const QueryType = makeType(spec, "f2887f6f-bd51-5422-8ac7-d1732fdcd17d", literal);
const TransactionAccessMode = makeType(spec, "775fc501-0b35-57fa-8587-cd7c53557cdf", literal);
const TransactionDeferrability = makeType(spec, "2eb021ec-461e-5b65-859c-26c1eee234a1", literal);
const TransactionIsolation = makeType(spec, "070715f3-0100-5580-9473-696f961243eb", literal);
const VersionStage = makeType(spec, "16a08f13-b1b1-57f4-8e82-062f67fb2a4c", literal);
const $SystemObject = makeType(spec, "43f8d5e9-5b2e-535b-a46b-acf8af101718", literal);
const SystemObject = PathNode($toSet($SystemObject, Cardinality$1.Many), null);
const $ExternalObject = makeType(spec, "e3838826-d523-59f9-86f4-be3cecdf0d4f", literal);
const ExternalObject = PathNode($toSet($ExternalObject, Cardinality$1.Many), null);
const $Branch = makeType(spec, "2572fefc-1810-5379-bc6e-af9b8cf3943b", literal);
const Branch = PathNode($toSet($Branch, Cardinality$1.Many), null);
const $Database = makeType(spec, "fd469647-1cf1-5702-85b6-bbdb7e7f1c7e", literal);
const Database = PathNode($toSet($Database, Cardinality$1.Many), null);
const $ExtensionPackage = makeType(spec, "87787989-1e54-5529-9cc4-524cc873528d", literal);
const ExtensionPackage = PathNode($toSet($ExtensionPackage, Cardinality$1.Many), null);
const $ExtensionPackageMigration = makeType(spec, "e3aaabec-f88b-5fe0-b06e-cea0b3d46fa8", literal);
const ExtensionPackageMigration = PathNode($toSet($ExtensionPackageMigration, Cardinality$1.Many), null);
const $QueryStats = makeType(spec, "ce92490c-1d17-5950-8bdd-cf9e23817551", literal);
const QueryStats = PathNode($toSet($QueryStats, Cardinality$1.Many), null);
const $Role = makeType(spec, "04d3804d-c37f-5969-86b2-a24309653b14", literal);
const Role = PathNode($toSet($Role, Cardinality$1.Many), null);
function get_current_branch(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("sys::get_current_branch", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "sys::get_current_branch",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function reset_query_stats(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("sys::reset_query_stats", args, spec, [
    { args: [], namedArgs: { "branch_name": { typeId: "00000000-0000-0000-0000-000000000101", optional: true, setoftype: false, variadic: false }, "id": { typeId: "00000000-0000-0000-0000-000000000100", optional: true, setoftype: false, variadic: false }, "minmax_only": { typeId: "00000000-0000-0000-0000-000000000109", optional: true, setoftype: false, variadic: false } }, returnTypeId: "00000000-0000-0000-0000-00000000010a", returnTypemod: "OptionalType" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "sys::reset_query_stats",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function get_version(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("sys::get_version", args, spec, [
    { args: [], returnTypeId: "48a4615d-2402-5744-bd11-17015ad18bb9" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "sys::get_version",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function get_version_as_str(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("sys::get_version_as_str", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "sys::get_version_as_str",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function get_instance_name(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("sys::get_instance_name", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "sys::get_instance_name",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function get_transaction_isolation(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("sys::get_transaction_isolation", args, spec, [
    { args: [], returnTypeId: "070715f3-0100-5580-9473-696f961243eb" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "sys::get_transaction_isolation",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
function get_current_database(...args) {
  const { returnType, cardinality, args: positionalArgs, namedArgs } = $resolveOverload("sys::get_current_database", args, spec, [
    { args: [], returnTypeId: "00000000-0000-0000-0000-000000000101" }
  ]);
  return $expressionify({
    __kind__: ExpressionKind.Function,
    __element__: returnType,
    __cardinality__: cardinality,
    __name__: "sys::get_current_database",
    __args__: positionalArgs,
    __namedargs__: namedArgs
  });
}
const __defaultExports = {
  "OutputFormat": OutputFormat,
  "QueryType": QueryType,
  "TransactionAccessMode": TransactionAccessMode,
  "TransactionDeferrability": TransactionDeferrability,
  "TransactionIsolation": TransactionIsolation,
  "VersionStage": VersionStage,
  "SystemObject": SystemObject,
  "ExternalObject": ExternalObject,
  "Branch": Branch,
  "Database": Database,
  "ExtensionPackage": ExtensionPackage,
  "ExtensionPackageMigration": ExtensionPackageMigration,
  "QueryStats": QueryStats,
  "Role": Role,
  "get_current_branch": get_current_branch,
  "reset_query_stats": reset_query_stats,
  "get_version": get_version,
  "get_version_as_str": get_version_as_str,
  "get_instance_name": get_instance_name,
  "get_transaction_isolation": get_transaction_isolation,
  "get_current_database": get_current_database
};
const ExportDefault = {
  ...__defaultExports$7,
  ...__defaultExports$5,
  ...util.omitDollarPrefixed($syntax),
  ...$op,
  "std": __defaultExports$7,
  "cfg": __defaultExports$6,
  "default": __defaultExports$5,
  "ext": __defaultExports$2,
  "schema": __defaultExports$1,
  "sys": __defaultExports
};
export {
  ExportDefault as E
};
